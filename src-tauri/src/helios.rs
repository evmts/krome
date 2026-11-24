//! Tauri commands that run a Helios light client and expose verified chain data
//! to the frontend. The JS side lives in src/lib/rust-bridge.ts.

use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use serde_json::Value;
use tauri::{AppHandle, Manager, State};

use helios::core::types::BlockTag;
use helios::ethereum::config::networks::Network;
use helios::ethereum::database::FileDB;
use helios::ethereum::{EthereumClient, EthereumClientBuilder};

/// Consensus RPC used when the frontend does not pass one.
pub const DEFAULT_CONSENSUS_RPC: &str = "https://www.lightclientdata.org";

type Client = EthereumClient<FileDB>;

/// The running Helios client, if any. Commands clone the `Arc` so requests do
/// not hold the lock across `.await` and never race each other for the client.
#[derive(Default)]
pub struct HeliosState(pub Mutex<Option<Arc<Client>>>);

impl HeliosState {
    fn get(&self) -> Result<Arc<Client>, String> {
        self.0
            .lock()
            .map_err(|_| "Helios state lock poisoned".to_string())?
            .clone()
            .ok_or_else(|| "Client not started".to_string())
    }

    fn replace(&self, client: Option<Arc<Client>>) -> Result<Option<Arc<Client>>, String> {
        let mut guard = self
            .0
            .lock()
            .map_err(|_| "Helios state lock poisoned".to_string())?;
        Ok(std::mem::replace(&mut *guard, client))
    }
}

/// Maps an EVM chain ID to a Helios network. Keep in sync with
/// `SUPPORTED_CHAIN_IDS` in src/lib/helios-config.ts.
pub fn get_network(chain_id: u64) -> Result<Network, String> {
    match chain_id {
        1 => Ok(Network::Mainnet),
        _ => Err(format!("Unsupported chain ID: {chain_id}")),
    }
}

/// Picks the consensus RPC, treating a missing or blank value as the default.
pub fn resolve_consensus_rpc(consensus_rpc: Option<String>) -> String {
    consensus_rpc
        .map(|url| url.trim().to_string())
        .filter(|url| !url.is_empty())
        .unwrap_or_else(|| DEFAULT_CONSENSUS_RPC.to_string())
}

/// Helios checkpoint storage, scoped per network inside the app data dir so it
/// never lands in the process working directory.
pub fn data_dir(app_data_dir: PathBuf, network: Network) -> PathBuf {
    app_data_dir
        .join("helios")
        .join(format!("{network:?}").to_lowercase())
}

#[tauri::command]
pub async fn start_helios(
    state: State<'_, HeliosState>,
    app_handle: AppHandle,
    rpc_url: String,
    consensus_rpc: Option<String>,
    chain_id: u64,
) -> Result<(), String> {
    let network = get_network(chain_id)?;
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {e}"))?;

    let mut client: Client = EthereumClientBuilder::new()
        .network(network)
        .execution_rpc(&rpc_url)
        .consensus_rpc(&resolve_consensus_rpc(consensus_rpc))
        .data_dir(data_dir(app_data_dir, network))
        .build()
        .map_err(|e| format!("Failed to build client: {e:?}"))?;

    client
        .start()
        .await
        .map_err(|e| format!("Failed to start client: {e:?}"))?;
    client.wait_synced().await;

    // Swap in the new client, then stop the old one outside the lock.
    if let Some(previous) = state.replace(Some(Arc::new(client)))? {
        previous.shutdown().await;
    }
    Ok(())
}

#[tauri::command]
pub async fn get_latest_block(state: State<'_, HeliosState>) -> Result<Value, String> {
    let client = state.get()?;
    let block = client
        .get_block_by_number(BlockTag::Latest, false)
        .await
        .map_err(|e| format!("Failed to get block: {e:?}"))?;
    serde_json::to_value(block).map_err(|e| format!("Serialization error: {e:?}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mainnet_is_supported() {
        assert!(matches!(get_network(1), Ok(Network::Mainnet)));
    }

    #[test]
    fn unsupported_chain_reports_its_id() {
        assert_eq!(get_network(10).unwrap_err(), "Unsupported chain ID: 10");
    }

    /// Property: every chain ID except 1 is rejected with a message that
    /// names it. Uses a deterministic xorshift stream so no extra crates are
    /// needed and failures reproduce exactly.
    #[test]
    fn property_only_chain_one_is_supported() {
        let mut x: u64 = 0x9E37_79B9_7F4A_7C15;
        let mut ids = vec![0, 2, u64::MAX, 11_155_111, 17_000];
        for _ in 0..10_000 {
            x ^= x << 13;
            x ^= x >> 7;
            x ^= x << 17;
            ids.push(x);
        }
        for id in ids.into_iter().filter(|&id| id != 1) {
            let err = get_network(id).expect_err("non-mainnet chain must be rejected");
            assert!(err.ends_with(&id.to_string()), "{err}");
        }
    }

    #[test]
    fn consensus_rpc_defaults_when_missing_or_blank() {
        assert_eq!(resolve_consensus_rpc(None), DEFAULT_CONSENSUS_RPC);
        assert_eq!(
            resolve_consensus_rpc(Some("  ".into())),
            DEFAULT_CONSENSUS_RPC
        );
        assert_eq!(
            resolve_consensus_rpc(Some(" https://c.example ".into())),
            "https://c.example"
        );
    }

    #[test]
    fn data_dir_is_scoped_by_network() {
        assert_eq!(
            data_dir(PathBuf::from("/app"), Network::Mainnet),
            PathBuf::from("/app/helios/mainnet")
        );
    }

    #[test]
    fn state_reports_not_started() {
        let state = HeliosState::default();
        assert_eq!(state.get().err().as_deref(), Some("Client not started"));
        assert!(state.replace(None).unwrap().is_none());
    }
}

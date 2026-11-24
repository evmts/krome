# Architecture

Krome is a Tauri 2 app: a Rust process owns native capabilities and a system
WebView renders a Svelte 5 single-page app. They talk over Tauri IPC.

```
┌──────────────────────────── WebView (Svelte 5 SPA) ───────────────────────────┐
│ src/routes/+page.svelte                                                        │
│   ├─ validateHeliosParams()      src/lib/helios-config.ts  (input checks)      │
│   ├─ RustBridge                  src/lib/rust-bridge.ts    (typed invoke)      │
│   │    └─ pollLatestBlock()      src/lib/block-poller.ts   (dedupe + retries)  │
│   ├─ BlockTable.svelte           src/lib/block-format.ts   (render rules)      │
│   ├─ ReactWrapper → RainbowKit   src/react/                (wallet connect)    │
│   └─ Tevm memory client          contracts/*.sol imports   (local EVM)         │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │ invoke("start_helios" | "get_latest_block")
┌───────────────────────────────▼──────────── Rust (src-tauri) ─────────────────┐
│ lib.rs   registers commands and HeliosState                                    │
│ helios.rs                                                                      │
│   start_helios     build + sync a Helios client, swap it into HeliosState      │
│   get_latest_block clone Arc<client>, fetch verified latest block              │
│   checkpoints      <app data dir>/helios/<network>                             │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │ HTTPS
                execution RPC (untrusted)   consensus RPC (light-client data)
```

## Data flow: showing the latest block

1. The form calls `validateHeliosParams`. Invalid input never reaches Rust.
2. `RustBridge.start` invokes `start_helios`. Rust maps the chain ID to a Helios
   network, builds the client, and waits for it to sync. A previous client is
   shut down after the new one is in place.
3. `RustBridge.getLatestBlock` returns `pollLatestBlock`, an async generator that
   calls `get_latest_block` every second, yields only when the head hash changes,
   and throws after more than 10 consecutive failures.
4. `BlockTable` renders each field according to `classifyValue`.

Helios verifies execution data against the consensus light client, so the
execution RPC does not need to be trusted for the data Helios proves.

## Why these pieces

| Concern | Choice | Reason |
| --- | --- | --- |
| Native shell | Tauri 2 | Small binaries, Rust backend, desktop and mobile targets |
| UI | Svelte 5 runes, SPA via adapter-static | No server in a Tauri app |
| Wallets | RainbowKit + wagmi in a React island | Mature wallet UX; `ReactWrapper.svelte` owns the React root |
| Chain data | Helios in Rust | Trust-minimized reads without a trusted RPC |
| Local EVM | Tevm | Simulate and test contracts in JS with compiled `.sol` imports |
| Contracts | Foundry | Fuzz tests and deploy scripts |

## Module boundaries

- `src/lib/*` has no Svelte or DOM dependency, so unit, property, and benchmark
  tests cover it directly.
- `RustBridge` takes an injectable `invoke`, which is the seam for tests and for
  the Playwright IPC mock in `e2e/tauri-mock.ts`.
- `helios.rs` keeps pure helpers (`get_network`, `resolve_consensus_rpc`,
  `data_dir`) separate from the Tauri commands so `cargo test` covers them
  without a network.

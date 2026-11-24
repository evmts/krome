<script lang="ts">
  import { onDestroy } from "svelte";
  import { RustBridge, type Block } from "../lib/rust-bridge.js";
  import { DEFAULT_CONSENSUS_RPC, validateHeliosParams } from "../lib/helios-config.js";
  import BlockTable from "../components/BlockTable.svelte";
  import ReactWrapper from "../react/ReactWrapper.svelte";
  import { RainbowKitButton } from "../react/RainbowKitWrapper";
  import { getDefaultConfig } from "@rainbow-me/rainbowkit";
  import { mainnet, optimism, base } from "wagmi/chains";
  import { createElement } from "react";
  import { QueryClient } from "@tanstack/react-query";
  import { http } from "viem";

  // WalletConnect Cloud project ID. Replace it with your own for production:
  // https://cloud.reown.com
  const WALLETCONNECT_PROJECT_ID = "898f836c53a18d0661340823973f0cb4";

  const appState = $state({
    rpcUrl: "https://rpc.ankr.com/eth",
    consensusRpc: DEFAULT_CONSENSUS_RPC,
    chainId: 1,
    statusMsg: "",
    latestBlock: null as Block | null,
    loading: false,
  });

  const wagmiConfig = getDefaultConfig({
    appName: "Krome",
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: [mainnet, optimism, base],
    ssr: false,
    appDescription: "A svelte/tauri based framework",
    transports: {
      [mainnet.id]: http(appState.rpcUrl),
    },
  });
  // RainbowKit/wagmi are React libraries and need React Query's client.
  const reactQueryClient = new QueryClient();

  const rustBridge = RustBridge.getInstance();

  let blockIterator: AsyncGenerator<Block, void, unknown> | null = null;

  async function onsubmit(event: Event) {
    event.preventDefault();

    if (blockIterator) {
      await blockIterator.return();
      blockIterator = null;
    }

    const validation = validateHeliosParams({
      rpcUrl: appState.rpcUrl,
      consensusRpc: appState.consensusRpc,
      chainId: Number(appState.chainId),
    });
    if (!validation.ok) {
      appState.statusMsg = validation.errors.join(". ");
      return;
    }

    appState.loading = true;
    appState.statusMsg = "";

    try {
      await rustBridge.start(validation.params);
      appState.statusMsg = "Helios started successfully.";
    } catch (e) {
      appState.statusMsg = "Error starting Helios: " + e;
      return;
    } finally {
      appState.loading = false;
    }

    const iterator = rustBridge.getLatestBlock();
    blockIterator = iterator;

    (async () => {
      try {
        for await (const block of iterator) {
          appState.latestBlock = block;
        }
      } catch (e) {
        appState.statusMsg = "Polling stopped: " + (e as Error).message;
      }
    })();
  }

  onDestroy(() => {
    blockIterator?.return();
  });
</script>

<main class="container">
  <h1>Helios with Svelte Runes</h1>

  <div class="rainbow-wrapper">
    <ReactWrapper
      element={createElement(RainbowKitButton, {
        config: wagmiConfig,
        queryClient: reactQueryClient,
      })}
    />
  </div>

  <form {onsubmit}>
    <div>
      <label for="rpcUrl">RPC URL:</label>
      <input
        id="rpcUrl"
        type="text"
        placeholder="Enter RPC URL..."
        bind:value={appState.rpcUrl}
      />
    </div>
    <div>
      <label for="consensusRpc">Consensus RPC:</label>
      <input
        id="consensusRpc"
        type="text"
        placeholder="Enter Consensus RPC..."
        bind:value={appState.consensusRpc}
      />
    </div>
    <div>
      <label for="chainId">Chain ID:</label>
      <input
        id="chainId"
        type="number"
        placeholder="Enter Chain ID..."
        bind:value={appState.chainId}
      />
    </div>
    <button type="submit" disabled={appState.loading}>
      {appState.loading
        ? "Starting Helios..."
        : "Start Helios and Get Latest Block"}
    </button>
  </form>

  {#if appState.loading}
    <p>Loading Helios, please wait...</p>
  {/if}

  <p data-testid="status">{appState.statusMsg}</p>
  <BlockTable block={appState.latestBlock ?? {}} />
</main>

<style>
  .container {
    margin: 0;
    padding-top: 10vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    align-items: center;
  }
  .rainbow-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  form > div {
    margin-bottom: 10px;
  }
  label {
    margin-right: 10px;
  }
  input {
    padding: 0.6em 1.2em;
    border-radius: 8px;
    border: 1px solid #ccc;
  }
  button {
    padding: 0.6em 1.2em;
    border-radius: 8px;
    border: none;
    background-color: #24c8db;
    color: white;
    cursor: pointer;
  }
  button:hover {
    background-color: #1aa1c9;
  }
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>

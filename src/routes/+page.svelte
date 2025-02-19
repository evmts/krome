<script lang="ts">
  import { onDestroy } from 'svelte';
  import { RustBridge } from '../lib/rust-bridge.js'
  import BlockTable from '../components/BlockTable.svelte';

  const state = $state({
    rpcUrl: "http://localhost:8545",
    consensusRpc: "https://www.lightclientdata.org",
    chainId: 1,
    statusMsg: "",
    latestBlock: "",
    loading: false
  });

  const rustBridge = RustBridge.getInstance()

  let blockIterator: AsyncGenerator<any, void, unknown> | null = null;

  async function onsubmit(event: Event) {
    event.preventDefault();

    if (blockIterator) {
      await blockIterator.return();
      blockIterator = null;
    }

    state.loading = true;
    state.statusMsg = "";

    try {
      await rustBridge.start({
        rpcUrl: state.rpcUrl,
        consensusRpc: state.consensusRpc,
        chainId: state.chainId
      });
      state.statusMsg = "Helios started successfully.";
    } catch (e) {
      state.statusMsg = "Error starting Helios: " + e;
      state.loading = false;
      return;
    }

    state.loading = false;

    blockIterator = rustBridge.getLatestBlock();

    (async () => {
      try {
        for await (const block of blockIterator!) {
          state.latestBlock = JSON.stringify(block, null, 2);
        }
      } catch (e) {
        console.error("Polling terminated:", e);
      }
    })();
  }

  onDestroy(() => {
    if (blockIterator) {
      blockIterator.return();
    }
  });
</script>

<main class="container">
  <h1>Helios with Svelte Runes</h1>

  <form {onsubmit}>
    <div>
      <label for="rpcUrl">RPC URL:</label>
      <input id="rpcUrl" type="text" placeholder="Enter RPC URL..." bind:value={state.rpcUrl} />
    </div>
    <div>
      <label for="consensusRpc">Consensus RPC:</label>
      <input id="consensusRpc" type="text" placeholder="Enter Consensus RPC..." bind:value={state.consensusRpc} />
    </div>
    <div>
      <label for="chainId">Chain ID:</label>
      <input id="chainId" type="number" placeholder="Enter Chain ID..." bind:value={state.chainId} />
    </div>
    <button type="submit" disabled={state.loading}>
      {state.loading ? "Starting Helios..." : "Start Helios and Get Latest Block"}
    </button>
  </form>

  {#if state.loading}
    <p>Loading Helios, please wait...</p>
  {/if}

  <p>{state.statusMsg}</p>
  <BlockTable block={state.latestBlock ? JSON.parse(state.latestBlock) : {}} />
</main>

<style>
  .container {
    margin: 0;
    padding-top: 10vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
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

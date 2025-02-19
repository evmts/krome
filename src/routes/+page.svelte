<script lang="ts">
  import { RustBridge } from '../lib/rust-bridge.js'

  const state = $state({
    rpcUrl: "http://localhost:8545",
    consensusRpc: "https://www.lightclientdata.org",
    chainId: 1,
    statusMsg: "",
    latestBlock: ""
  });

  const rustBridge = RustBridge.getInstance()

  async function onsubmit(event: Event) {
    event.preventDefault();

    try {
      await rustBridge.start({
        rpcUrl: state.rpcUrl,
        consensusRpc: state.consensusRpc,
        chainId: state.chainId
      });
      state.statusMsg = "Helios started successfully.";
    } catch (e) {
      state.statusMsg = "Error starting Helios: " + e;
      return;
    }

    try {
      const block = await rustBridge.getLatestBlock();
      state.latestBlock = JSON.stringify(block, null, 2);
    } catch (e) {
      state.latestBlock = "Error fetching block: " + e;
    }
  }
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
    <button type="submit">Start Helios and Get Latest Block</button>
  </form>

  <p>{state.statusMsg}</p>
  <pre>{state.latestBlock}</pre>
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
</style>

<script lang="ts">
  import { classifyValue, columnsOf, formatPrimitive } from "../lib/block-format.js";

  let { block }: { block: Record<string, unknown> } = $props();
</script>

<table class="block-table" data-testid="block-table">
  <thead>
    <tr>
      <th>Field</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    {#each Object.entries(block) as [key, value] (key)}
      {@const kind = classifyValue(value)}
      <tr>
        <td class="key">{key}</td>
        <td class="value">
          {#if kind === "empty-array"}
            <em>Empty Array</em>
          {:else if kind === "object-array"}
            {@const rows = value as Record<string, unknown>[]}
            {@const columns = columnsOf(rows)}
            <!-- Nested table for an array of objects (e.g. withdrawals) -->
            <table class="nested-table">
              <thead>
                <tr>
                  {#each columns as column}
                    <th>{column}</th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each rows as row}
                  <tr>
                    {#each columns as column}
                      <td>{formatPrimitive(row[column])}</td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else if kind === "primitive-array"}
            <!-- List for an array of primitives (e.g. transaction hashes) -->
            <ul class="array-list">
              {#each value as unknown[] as item}
                <li>{formatPrimitive(item)}</li>
              {/each}
            </ul>
          {:else if kind === "object"}
            <pre>{JSON.stringify(value, null, 2)}</pre>
          {:else}
            {formatPrimitive(value)}
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .block-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-family: sans-serif;
    font-size: 14px;
  }

  .block-table th,
  .block-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .block-table th {
    background-color: #f4f4f4;
    font-weight: bold;
  }

  .block-table tr:nth-child(even) {
    background-color: #fafafa;
  }

  .block-table tr:hover {
    background-color: #f1f1f1;
  }

  .nested-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }

  .nested-table th,
  .nested-table td {
    border: 1px solid #ccc;
    padding: 6px;
    font-size: 12px;
  }

  .nested-table th {
    background-color: #eaeaea;
  }

  .array-list {
    list-style: disc;
    margin: 0;
    padding-left: 20px;
  }
</style> 
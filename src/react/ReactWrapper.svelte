<script lang="ts">
  import { createRoot, type Root } from "react-dom/client";
  import type { ReactElement } from "react";

  let { element }: { element: ReactElement } = $props();

  let container = $state<HTMLDivElement>();
  let root: Root | undefined;

  // Create the React root once, re-render when `element` changes, and
  // unmount when the Svelte component is destroyed.
  $effect(() => {
    if (!container) return;
    root ??= createRoot(container);
    root.render(element);
  });

  $effect(() => () => {
    root?.unmount();
    root = undefined;
  });
</script>

<div bind:this={container}></div>

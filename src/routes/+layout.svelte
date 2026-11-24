<script lang="ts">
  import type { Snippet } from "svelte";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";

  let { children }: { children: Snippet } = $props();
  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  {@render children()}
</QueryClientProvider>

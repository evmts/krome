import { defineConfig } from "vitest/config";
import { vitePluginTevm as tevm } from "tevm/bundler/vite-plugin";

// Contract e2e tests need `anvil` and `forge` (Foundry) on PATH,
// or ANVIL_BIN / FORGE_BIN pointing at them.
export default defineConfig({
  plugins: [tevm()],
  test: { include: ["e2e/**/*.e2e.ts"], testTimeout: 60_000, fileParallelism: false },
});

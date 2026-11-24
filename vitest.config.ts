import { defineConfig } from "vitest/config";
import { vitePluginTevm as tevm } from "tevm/bundler/vite-plugin";

// Separate from vite.config.js so unit tests skip the SvelteKit plugin.
// The Tevm plugin compiles `.sol` imports in contracts/*.spec.ts.
export default defineConfig({
  plugins: [tevm()],
  test: {
    include: ["src/**/*.test.ts", "contracts/**/*.spec.ts"],
    benchmark: { include: ["src/**/*.bench.ts", "contracts/**/*.bench.ts"] },
  },
});

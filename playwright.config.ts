import { defineConfig, devices } from "@playwright/test";

// UI e2e: serves the production build with `vite preview` and drives it in
// Chromium. Tauri IPC is mocked in e2e/tauri-mock.ts, so no Rust build is needed.
// Locally, set PW_CHANNEL=chrome to reuse an installed Google Chrome.
const PORT = 4173;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.pw.ts",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL },
    },
  ],
  webServer: {
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});

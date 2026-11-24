import { expect, test } from "@playwright/test";
import { invokes, mockTauri } from "./tauri-mock";

test("renders the Helios form with defaults", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Helios with Svelte Runes" })).toBeVisible();
  await expect(page.getByLabel("RPC URL:")).toHaveValue("https://rpc.ankr.com/eth");
  await expect(page.getByLabel("Chain ID:")).toHaveValue("1");
  await expect(page.getByRole("button", { name: "Start Helios and Get Latest Block" })).toBeEnabled();
});

test("starts Helios and renders new blocks as the head changes", async ({ page }) => {
  await mockTauri(page, { hashes: ["0xaaa", "0xbbb"] });
  await page.goto("/");
  await page.getByRole("button", { name: "Start Helios and Get Latest Block" }).click();

  await expect(page.getByTestId("status")).toHaveText("Helios started successfully.");
  const table = page.getByTestId("block-table");
  await expect(table.getByRole("row", { name: /hash 0xaaa/ })).toBeVisible();
  await expect(table.getByText("0xt2")).toBeVisible();
  // Polling runs every second; the second head replaces the first.
  await expect(table.getByRole("row", { name: /hash 0xbbb/ })).toBeVisible({ timeout: 5_000 });

  const start = (await invokes(page)).find((c) => c.cmd === "start_helios");
  expect(start?.args).toEqual({
    rpcUrl: "https://rpc.ankr.com/eth",
    consensusRpc: "https://www.lightclientdata.org",
    chainId: 1,
  });
});

test("rejects unsupported chain IDs without calling Rust", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/");
  await page.getByLabel("Chain ID:").fill("10");
  await page.getByRole("button", { name: "Start Helios and Get Latest Block" }).click();

  await expect(page.getByTestId("status")).toHaveText("Unsupported chain ID: 10. Supported: 1");
  expect((await invokes(page)).some((c) => c.cmd === "start_helios")).toBe(false);
});

test("shows the Rust error when Helios fails to start", async ({ page }) => {
  await mockTauri(page, { startError: "Failed to start client: timeout" });
  await page.goto("/");
  await page.getByRole("button", { name: "Start Helios and Get Latest Block" }).click();

  await expect(page.getByTestId("status")).toHaveText("Error starting Helios: Failed to start client: timeout");
  await expect(page.getByRole("button", { name: "Start Helios and Get Latest Block" })).toBeEnabled();
});

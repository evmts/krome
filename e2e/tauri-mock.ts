import type { Page } from "@playwright/test";

export interface MockOptions {
  /** Error string start_helios rejects with, if any. */
  startError?: string;
  /** Hashes returned by successive get_latest_block calls; the last one repeats. */
  hashes?: string[];
}

/**
 * Installs a fake `window.__TAURI_INTERNALS__` so `@tauri-apps/api/core`
 * `invoke` works in a plain browser. Every call is recorded in
 * `window.__invokes` for assertions.
 */
export async function mockTauri(page: Page, options: MockOptions = {}) {
  await page.addInitScript((opts: MockOptions) => {
    const calls: Array<{ cmd: string; args: unknown }> = [];
    let polls = 0;
    const hashes = opts.hashes ?? ["0xaaa"];
    (window as any).__invokes = calls;
    (window as any).__TAURI_INTERNALS__ = {
      transformCallback: () => 0,
      invoke: async (cmd: string, args: unknown) => {
        calls.push({ cmd, args });
        if (cmd === "start_helios") {
          if (opts.startError) throw opts.startError;
          return null;
        }
        if (cmd === "get_latest_block") {
          const hash = hashes[Math.min(polls++, hashes.length - 1)];
          return {
            number: `0x${(100 + polls).toString(16)}`,
            hash,
            parentHash: "0x000",
            timestamp: "0x6750",
            transactions: ["0xt1", "0xt2"],
            withdrawals: [{ index: "0x1", amount: "0x10" }],
          };
        }
        throw `unknown command ${cmd}`;
      },
    };
  }, options);
}

export const invokes = (page: Page) =>
  page.evaluate(() => (window as any).__invokes as Array<{ cmd: string; args: any }>);

import { describe, expect, test, vi } from "vitest";
import { RustBridge } from "./rust-bridge.js";

describe("RustBridge", () => {
  test("start invokes start_helios with camelCase args", async () => {
    const invoke = vi.fn(async () => undefined);
    await new RustBridge(invoke as never).start({ rpcUrl: "https://r", chainId: 1 });
    expect(invoke).toHaveBeenCalledWith("start_helios", { rpcUrl: "https://r", chainId: 1 });
  });

  test("start propagates Rust errors", async () => {
    const invoke = vi.fn(async () => {
      throw "Unsupported chain ID: 5";
    });
    await expect(new RustBridge(invoke as never).start({ rpcUrl: "https://r", chainId: 5 })).rejects.toBe(
      "Unsupported chain ID: 5",
    );
  });

  test("getLatestBlock polls get_latest_block", async () => {
    const invoke = vi.fn(async () => ({ hash: "0x1", number: "0x1", parentHash: "0x0", timestamp: "0x0" }));
    const gen = new RustBridge(invoke as never).getLatestBlock({ sleep: () => Promise.resolve() });
    expect((await gen.next()).value?.hash).toBe("0x1");
    await gen.return();
    expect(invoke).toHaveBeenCalledWith("get_latest_block");
  });

  test("getInstance returns a singleton", () => {
    expect(RustBridge.getInstance()).toBe(RustBridge.getInstance());
  });
});

import { invoke } from "@tauri-apps/api/core";
import { pollLatestBlock, type Block } from "./block-poller.js";
import type { HeliosParams } from "./helios-config.js";

export type { Block } from "./block-poller.js";

type Invoke = <T>(command: string, args?: Record<string, unknown>) => Promise<T>;

/**
 * Typed wrapper around the Tauri commands in src-tauri/src/helios.rs.
 * TODO: generate these bindings with tauri-specta (issue #4).
 */
export class RustBridge {
  private static instance: RustBridge | undefined;

  constructor(private readonly invokeCommand: Invoke = invoke) {}

  public static getInstance(): RustBridge {
    RustBridge.instance ??= new RustBridge();
    return RustBridge.instance;
  }

  /** Starts Helios and resolves once it has synced. */
  async start(params: HeliosParams): Promise<void> {
    await this.invokeCommand<void>("start_helios", { ...params });
  }

  /** Fetches the latest block once. Rejects if Helios is not started. */
  getBlock(): Promise<Block> {
    return this.invokeCommand<Block>("get_latest_block");
  }

  /** Yields the latest block every time the head hash changes. */
  getLatestBlock(
    options: { intervalMs?: number; sleep?: (ms: number) => Promise<void> } = {},
  ): AsyncGenerator<Block, void, unknown> {
    return pollLatestBlock({ fetchBlock: () => this.getBlock(), ...options });
  }
}

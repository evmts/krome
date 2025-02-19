import { invoke } from "@tauri-apps/api/core";

// TODO we want to make this typesafe and generated using specta-rs
export interface Block {
  number: string;
  hash: string;
  parentHash: string;
  timestamp: string;
}

export class RustBridge {
  private static instance: RustBridge;

  private constructor() { }

  public static getInstance(): RustBridge {
    if (!RustBridge.instance) {
      RustBridge.instance = new RustBridge();
    }
    return RustBridge.instance;
  }

  async start(params: {rpcUrl: string, chainId: number, consensusRpc?: string}): Promise<void> {
    try {
      await invoke('start_helios', params);
    } catch (error) {
      console.error('Failed to start Helios:', error);
      throw error;
    }
  }

  async getLatestBlock(): Promise<Block> {
    try {
      const block = await invoke<Block>('get_latest_block');
      return block;
    } catch (error) {
      console.error('Failed to get latest block:', error);
      throw error;
    }
  }
} 

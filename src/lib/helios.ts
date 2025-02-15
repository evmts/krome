import { invoke } from '@tauri-apps/api';

export interface Block {
  number: string;
  hash: string;
  parentHash: string;
  timestamp: string;
  // Add other block fields as needed
}

export class HeliosClient {
  private static instance: HeliosClient;

  private constructor() {}

  public static getInstance(): HeliosClient {
    if (!HeliosClient.instance) {
      HeliosClient.instance = new HeliosClient();
    }
    return HeliosClient.instance;
  }

  async start(rpcUrl: string, chainId: number, consensusRpc?: string): Promise<void> {
    try {
      await invoke('start_helios', {
        rpcUrl,
        consensusRpc,
        chainId,
      });
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
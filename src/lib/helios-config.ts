/**
 * Chain IDs the Rust Helios integration accepts. Keep in sync with
 * `get_network` in src-tauri/src/helios.rs.
 */
export const SUPPORTED_CHAIN_IDS = [1] as const;

export const DEFAULT_CONSENSUS_RPC = "https://www.lightclientdata.org";

export interface HeliosParams {
  rpcUrl: string;
  consensusRpc?: string;
  chainId: number;
}

export type ValidationResult =
  | { ok: true; params: HeliosParams }
  | { ok: false; errors: string[] };

function isHttpUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * Validates and normalizes user input before it crosses the JS -> Rust
 * boundary. Trims URLs, drops an empty consensus RPC, and rejects chain IDs
 * that Helios does not support.
 */
export function validateHeliosParams(input: HeliosParams): ValidationResult {
  const errors: string[] = [];
  const rpcUrl = input.rpcUrl.trim();
  const consensusRpc = input.consensusRpc?.trim() || undefined;

  if (!isHttpUrl(rpcUrl)) {
    errors.push("RPC URL must be an http(s) URL");
  }
  if (consensusRpc !== undefined && !isHttpUrl(consensusRpc)) {
    errors.push("Consensus RPC must be an http(s) URL");
  }
  if (
    !Number.isSafeInteger(input.chainId) ||
    !(SUPPORTED_CHAIN_IDS as readonly number[]).includes(input.chainId)
  ) {
    errors.push(
      `Unsupported chain ID: ${input.chainId}. Supported: ${SUPPORTED_CHAIN_IDS.join(", ")}`,
    );
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    params: consensusRpc === undefined
      ? { rpcUrl, chainId: input.chainId }
      : { rpcUrl, consensusRpc, chainId: input.chainId },
  };
}

/**
 * Shape of the block returned by the Rust `get_latest_block` command.
 * Helios serializes more fields; these are the ones the UI relies on.
 */
export interface Block {
  number: string;
  hash: string;
  parentHash: string;
  timestamp: string;
  [field: string]: unknown;
}

export interface PollOptions<T extends { hash: string }> {
  /** Fetches the current head block. Rejections count as failures. */
  fetchBlock: () => Promise<T>;
  /** Waits between polls. Injected so tests and benchmarks run without timers. */
  sleep?: (ms: number) => Promise<void>;
  /** Delay between polls in milliseconds. Defaults to 1000. */
  intervalMs?: number;
  /** Consecutive failures tolerated before the generator throws. Defaults to 10. */
  maxConsecutiveFailures?: number;
  /** Called with every fetch error that does not end the poll. */
  onError?: (error: unknown) => void;
}

export const DEFAULT_POLL_INTERVAL_MS = 1000;
export const DEFAULT_MAX_CONSECUTIVE_FAILURES = 10;

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Polls `fetchBlock` forever and yields each block whose hash differs from the
 * previously yielded block. A successful fetch resets the failure counter.
 * Throws after more than `maxConsecutiveFailures` failures in a row.
 * Stop polling by calling `return()` on the generator.
 */
export async function* pollLatestBlock<T extends { hash: string }>(
  options: PollOptions<T>,
): AsyncGenerator<T, void, unknown> {
  const {
    fetchBlock,
    sleep = defaultSleep,
    intervalMs = DEFAULT_POLL_INTERVAL_MS,
    maxConsecutiveFailures = DEFAULT_MAX_CONSECUTIVE_FAILURES,
    onError = (error) => console.error("Failed to get latest block:", error),
  } = options;

  let lastHash: string | undefined;
  let failures = 0;

  while (true) {
    try {
      const block = await fetchBlock();
      failures = 0;
      if (block.hash !== lastHash) {
        lastHash = block.hash;
        yield block;
      }
    } catch (error) {
      failures++;
      if (failures > maxConsecutiveFailures) {
        throw new Error(
          `Failed to get block ${failures} times in a row. Is Helios started and healthy?`,
          { cause: error },
        );
      }
      onError(error);
    }

    await sleep(intervalMs);
  }
}

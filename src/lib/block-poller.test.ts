import { describe, expect, test, vi } from "vitest";
import { pollLatestBlock } from "./block-poller.js";

const block = (hash: string) => ({ hash });
const noSleep = () => Promise.resolve();

/** Builds a fetcher that replays `script`: strings are hashes, Errors are rejections. */
function scripted(script: Array<string | Error>) {
  let i = 0;
  return vi.fn(async () => {
    const step = script[i++];
    if (step === undefined) throw new Error("script exhausted");
    if (step instanceof Error) throw step;
    return block(step);
  });
}

async function take<T>(gen: AsyncGenerator<T>, n: number): Promise<T[]> {
  const out: T[] = [];
  for await (const value of gen) {
    out.push(value);
    if (out.length === n) break;
  }
  return out;
}

describe("pollLatestBlock", () => {
  test("yields only when the head hash changes", async () => {
    const fetchBlock = scripted(["a", "a", "b", "b", "b", "c"]);
    const gen = pollLatestBlock({ fetchBlock, sleep: noSleep });
    expect((await take(gen, 3)).map((b) => b.hash)).toEqual(["a", "b", "c"]);
    expect(fetchBlock).toHaveBeenCalledTimes(6);
  });

  test("sleeps intervalMs between polls", async () => {
    const sleep = vi.fn(noSleep);
    const gen = pollLatestBlock({ fetchBlock: scripted(["a", "b"]), sleep, intervalMs: 250 });
    await take(gen, 2);
    expect(sleep).toHaveBeenCalledWith(250);
  });

  test("tolerates transient failures and resets the counter on success", async () => {
    const onError = vi.fn();
    const err = new Error("rpc down");
    const fetchBlock = scripted([err, err, "a", err, err, "b"]);
    const gen = pollLatestBlock({ fetchBlock, sleep: noSleep, maxConsecutiveFailures: 2, onError });
    expect((await take(gen, 2)).map((b) => b.hash)).toEqual(["a", "b"]);
    expect(onError).toHaveBeenCalledTimes(4);
  });

  test("throws after more than maxConsecutiveFailures failures in a row", async () => {
    const cause = new Error("Client not started");
    const gen = pollLatestBlock({
      fetchBlock: scripted([cause, cause, cause, cause]),
      sleep: noSleep,
      maxConsecutiveFailures: 3,
      onError: () => {},
    });
    await expect(gen.next()).rejects.toThrow(/4 times in a row/);
  });

  test("return() stops polling", async () => {
    const fetchBlock = scripted(["a", "b", "c"]);
    const gen = pollLatestBlock({ fetchBlock, sleep: noSleep });
    await gen.next();
    await gen.return();
    expect(await gen.next()).toEqual({ done: true, value: undefined });
    expect(fetchBlock).toHaveBeenCalledTimes(1);
  });
});

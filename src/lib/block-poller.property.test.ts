import fc from "fast-check";
import { describe, test } from "vitest";
import { pollLatestBlock } from "./block-poller.js";

/** Reference model: yields every element that differs from the previous yield. */
function dedupe(hashes: string[]): string[] {
  const out: string[] = [];
  for (const h of hashes) if (out.at(-1) !== h) out.push(h);
  return out;
}

describe("pollLatestBlock properties", () => {
  test("matches the dedupe model for any successful hash sequence", async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(fc.constantFrom("a", "b", "c"), { maxLength: 50 }), async (hashes) => {
        let i = 0;
        const expected = dedupe(hashes);
        const gen = pollLatestBlock({
          fetchBlock: async () => ({ hash: hashes[i++] }),
          sleep: () => Promise.resolve(),
        });
        const got: string[] = [];
        while (got.length < expected.length) got.push((await gen.next()).value!.hash);
        await gen.return();
        return JSON.stringify(got) === JSON.stringify(expected);
      }),
    );
  });

  test("throws iff some failure run is longer than the limit", async () => {
    // Each step: true = success with a fresh hash, false = failure.
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 40 }),
        fc.integer({ min: 0, max: 5 }),
        async (steps, limit) => {
          let i = 0;
          let run = 0;
          let longest = 0;
          for (const ok of steps) {
            run = ok ? 0 : run + 1;
            longest = Math.max(longest, run);
          }
          const gen = pollLatestBlock({
            fetchBlock: async () => {
              const step = steps[i];
              i++;
              if (step === undefined) throw new Error("done");
              if (!step) throw new Error("fail");
              return { hash: String(i) };
            },
            sleep: () => Promise.resolve(),
            maxConsecutiveFailures: limit,
            onError: () => {},
          });
          let threwEarly = false;
          try {
            for await (const _ of gen) if (i >= steps.length) break;
          } catch {
            // Thrown before the script was exhausted means a real failure run hit the limit.
            threwEarly = i <= steps.length;
          }
          return threwEarly === longest > limit;
        },
      ),
    );
  });
});

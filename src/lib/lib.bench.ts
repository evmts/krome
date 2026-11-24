import { bench, describe } from "vitest";
import { classifyValue, columnsOf } from "./block-format.js";
import { pollLatestBlock } from "./block-poller.js";
import { validateHeliosParams } from "./helios-config.js";

const withdrawals = Array.from({ length: 16 }, (_, i) => ({
  index: `0x${i.toString(16)}`,
  validatorIndex: "0x1",
  address: "0x0000000000000000000000000000000000000000",
  amount: "0x10",
}));

describe("block-format", () => {
  bench("classifyValue on a 16-withdrawal array", () => {
    classifyValue(withdrawals);
  });
  bench("columnsOf on 16 withdrawals", () => {
    columnsOf(withdrawals);
  });
});

describe("helios-config", () => {
  bench("validateHeliosParams (valid)", () => {
    validateHeliosParams({ rpcUrl: "https://rpc.example/eth", consensusRpc: "https://c.example", chainId: 1 });
  });
});

describe("block-poller", () => {
  bench("poll 1000 fetches with 50% duplicate heads", async () => {
    let i = 0;
    const gen = pollLatestBlock({
      fetchBlock: async () => ({ hash: String(i++ >> 1) }),
      sleep: () => Promise.resolve(),
    });
    for await (const _ of gen) if (i >= 1000) break;
  });
});

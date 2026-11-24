import fc from "fast-check";
import { describe, expect, test } from "vitest";
import { SUPPORTED_CHAIN_IDS, validateHeliosParams } from "./helios-config.js";

describe("validateHeliosParams", () => {
  test("accepts mainnet with https URLs and trims whitespace", () => {
    expect(
      validateHeliosParams({
        rpcUrl: "  https://rpc.example/eth ",
        consensusRpc: " https://www.lightclientdata.org ",
        chainId: 1,
      }),
    ).toEqual({
      ok: true,
      params: {
        rpcUrl: "https://rpc.example/eth",
        consensusRpc: "https://www.lightclientdata.org",
        chainId: 1,
      },
    });
  });

  test("drops an empty consensus RPC so Rust uses its default", () => {
    const result = validateHeliosParams({ rpcUrl: "http://localhost:8545", consensusRpc: "  ", chainId: 1 });
    expect(result).toEqual({ ok: true, params: { rpcUrl: "http://localhost:8545", chainId: 1 } });
  });

  test("reports every problem at once", () => {
    const result = validateHeliosParams({ rpcUrl: "ftp://x", consensusRpc: "nope", chainId: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual([
        "RPC URL must be an http(s) URL",
        "Consensus RPC must be an http(s) URL",
        "Unsupported chain ID: 10. Supported: 1",
      ]);
    }
  });

  test.each([Number.NaN, 1.5, -1, Number.MAX_SAFE_INTEGER + 2])("rejects chain ID %s", (chainId) => {
    expect(validateHeliosParams({ rpcUrl: "https://a.b", chainId }).ok).toBe(false);
  });
});

describe("validateHeliosParams properties (fuzz)", () => {
  test("never throws on arbitrary input", () => {
    fc.assert(
      fc.property(fc.string(), fc.option(fc.string(), { nil: undefined }), fc.double(), (rpcUrl, consensusRpc, chainId) => {
        validateHeliosParams({ rpcUrl, consensusRpc, chainId });
      }),
      { numRuns: 2000 },
    );
  });

  test("accepted params are always trimmed http(s) URLs with a supported chain", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.webUrl(), fc.string()),
        fc.oneof(fc.webUrl(), fc.constant(""), fc.string()),
        fc.oneof(fc.constantFrom(...SUPPORTED_CHAIN_IDS), fc.integer()),
        (rpcUrl, consensusRpc, chainId) => {
          const result = validateHeliosParams({ rpcUrl, consensusRpc, chainId });
          if (!result.ok) return result.errors.length > 0;
          const { params } = result;
          const urls = [params.rpcUrl, ...(params.consensusRpc ? [params.consensusRpc] : [])];
          return (
            (SUPPORTED_CHAIN_IDS as readonly number[]).includes(params.chainId) &&
            urls.every((u) => u === u.trim() && /^https?:$/.test(new URL(u).protocol))
          );
        },
      ),
      { numRuns: 2000 },
    );
  });
});

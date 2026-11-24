import fc from "fast-check";
import { describe, expect, test } from "vitest";
import { classifyValue, columnsOf, formatPrimitive } from "./block-format.js";

describe("classifyValue", () => {
  test.each([
    [[], "empty-array"],
    [[{ index: "0x1" }], "object-array"],
    [["0xabc"], "primitive-array"],
    [[null], "primitive-array"],
    [{ a: 1 }, "object"],
    [null, "primitive"],
    ["0x1", "primitive"],
    [12n, "primitive"],
  ] as const)("%s -> %s", (value, kind) => {
    expect(classifyValue(value)).toBe(kind);
  });

  test("is total over arbitrary JSON (fuzz)", () => {
    const kinds = new Set(["empty-array", "object-array", "primitive-array", "object", "primitive"]);
    fc.assert(fc.property(fc.jsonValue(), (v) => kinds.has(classifyValue(v))), { numRuns: 2000 });
  });
});

describe("columnsOf", () => {
  test("unions keys in first-seen order", () => {
    expect(columnsOf([{ a: 1, b: 2 }, { b: 3, c: 4 }])).toEqual(["a", "b", "c"]);
  });

  test("covers every key of every row with no duplicates (property)", () => {
    fc.assert(
      fc.property(fc.array(fc.dictionary(fc.string(), fc.integer())), (rows) => {
        const cols = columnsOf(rows);
        return new Set(cols).size === cols.length && rows.every((r) => Object.keys(r).every((k) => cols.includes(k)));
      }),
    );
  });
});

describe("formatPrimitive", () => {
  test.each([
    [null, "null"],
    [undefined, ""],
    [10n, "10"],
    [true, "true"],
    ["0x1", "0x1"],
  ])("%s -> %j", (value, text) => {
    expect(formatPrimitive(value)).toBe(text);
  });
});

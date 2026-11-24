/** How BlockTable renders one field of a block. */
export type ValueKind =
  | "empty-array"
  | "object-array"
  | "primitive-array"
  | "object"
  | "primitive";

export function classifyValue(value: unknown): ValueKind {
  if (Array.isArray(value)) {
    if (value.length === 0) return "empty-array";
    return typeof value[0] === "object" && value[0] !== null
      ? "object-array"
      : "primitive-array";
  }
  if (typeof value === "object" && value !== null) return "object";
  return "primitive";
}

/** Column names for a table of objects: the union of keys, in first-seen order. */
export function columnsOf(rows: readonly object[]): string[] {
  const columns = new Set<string>();
  for (const row of rows) {
    if (row === null || typeof row !== "object") continue;
    for (const key of Object.keys(row)) columns.add(key);
  }
  return [...columns];
}

/** Renders a primitive cell. Bigints and nullish values get explicit text. */
export function formatPrimitive(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "";
  if (typeof value === "bigint") return value.toString();
  return String(value);
}

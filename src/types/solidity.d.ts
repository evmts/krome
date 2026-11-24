// Fallback types for `.sol` imports when the Tevm TS plugin is not loaded
// (svelte-check, tsc). Editors with @tevm/ts-plugin resolve the real, fully
// typed contract instead. Add one declaration per Solidity file you import.
declare module "*/BankV1.s.sol" {
  export const BankV1: any;
}

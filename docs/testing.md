# Testing

| Layer | Command | Tool | Where |
| --- | --- | --- | --- |
| Lint / types | `pnpm lint` | svelte-check | all TS and Svelte |
| Unit | `pnpm test` | Vitest | `src/**/*.test.ts` |
| Property / fuzz (TS) | `pnpm test` | fast-check | `*.property.test.ts`, fuzz blocks in `helios-config.test.ts`, `block-format.test.ts` |
| Contract (Tevm) | `pnpm test` | Vitest + Tevm | `contracts/*.spec.ts` |
| Contract unit + fuzz | `pnpm contracts:test` | Foundry | `contracts/test/*.t.sol` |
| Benchmarks | `pnpm bench` | Vitest bench | `src/**/*.bench.ts`, `contracts/*.bench.ts` |
| UI e2e | `pnpm build && pnpm test:e2e` | Playwright | `e2e/*.pw.ts` |
| Contract e2e | `pnpm test:e2e:contracts` | Vitest + Anvil | `e2e/*.e2e.ts` |
| Rust unit + property | `cd src-tauri && cargo test` | cargo | `src-tauri/src/helios.rs` |

CI (`.github/workflows/ci.yml`) runs every row on each push and pull request,
plus `cargo clippy -D warnings`, `cargo fmt --check`, `forge fmt --check`, and a
Nix dev-shell smoke test.

## Notes

- The UI e2e suite serves the production build and replaces
  `window.__TAURI_INTERNALS__` with a recorder (`e2e/tauri-mock.ts`). It tests
  the full Svelte app and the JS side of the IPC contract without compiling Rust.
  The Rust side of that contract is covered by `cargo test`.
- Locally, `PW_CHANNEL=chrome pnpm test:e2e` reuses an installed Chrome instead
  of downloading Playwright's Chromium.
- Contract e2e tests need `anvil` and `forge` on `PATH`, or set `ANVIL_BIN` and
  `FORGE_BIN`.
- `FOUNDRY_PROFILE=ci` raises fuzz runs from 1,000 to 5,000.

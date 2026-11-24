# Contributing

1. Comment on [issue #4](https://github.com/evmts/krome/issues/4) or open an
   issue to claim work.
2. Set up: `corepack enable && pnpm install`, Rust stable, and Foundry
   (or `nix develop`).
3. Make the change with tests. See [docs/testing.md](./docs/testing.md).
4. Before opening a PR, run:

   ```bash
   pnpm lint && pnpm test && pnpm build && pnpm test:e2e
   forge fmt --check && forge test
   (cd src-tauri && cargo fmt --check && cargo clippy --all-targets -- -D warnings && cargo test)
   ```

5. Keep `SUPPORTED_CHAIN_IDS` (`src/lib/helios-config.ts`) and `get_network`
   (`src-tauri/src/helios.rs`) in sync when adding networks.

CI must be green before merge.

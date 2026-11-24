# Getting started

## Create an app

Krome is a template. Copy it, then make it yours.

```bash
npx degit evmts/krome my-app   # copy without git history
# or: fork https://github.com/evmts/krome on GitHub and clone your fork
cd my-app
corepack enable                # uses the pnpm version pinned in package.json
pnpm install
```

Then rename the app:

| File | Field |
| --- | --- |
| `package.json` | `name`, `description` |
| `src-tauri/Cargo.toml` | `name`, `description`, `authors`, `repository` |
| `src-tauri/tauri.conf.json` | `productName`, `identifier`, window `title` |
| `src/routes/+page.svelte` | `WALLETCONNECT_PROJECT_ID` (get one at https://cloud.reown.com) |

## Run

```bash
pnpm tauri dev      # native window, hot reload for Svelte and Rust
pnpm dev            # browser only; Tauri commands are unavailable
pnpm tauri build    # release bundle in src-tauri/target/release/bundle
```

Mobile: see [ios.md](../ios.md) and [android.md](../android.md).

## Add a Rust command

1. Write a `#[tauri::command]` function in `src-tauri/src/`.
2. Register it in `tauri::generate_handler![...]` in `src-tauri/src/lib.rs`.
3. Add a typed method to `src/lib/rust-bridge.ts` that calls `invoke("your_command", args)`.
   Tauri converts camelCase JS argument names to snake_case Rust parameters.
4. Unit-test the method with a fake `invoke` (see `src/lib/rust-bridge.test.ts`) and
   the Rust logic with `cargo test`.

## Use Solidity from TypeScript

Tevm compiles `.sol` imports at build time:

```ts
import { BankV1 } from "../contracts/BankV1.s.sol";
import { createMemoryClient } from "tevm";

const client = createMemoryClient();
const { createdAddress } = await client.tevmDeploy(BankV1.deploy());
```

`svelte-check` does not load the Tevm TS plugin, so add a one-line fallback
declaration per imported Solidity file in `src/types/solidity.d.ts`. Editors with
`@tevm/ts-plugin` (configured in `tsconfig.json`) still see full types.

## Deploy contracts

```bash
anvil &
pnpm contracts:deploy                                    # viem + Tevm-compiled bytecode
forge script contracts/script/DeployBankV1.s.sol \
  --rpc-url http://127.0.0.1:8545 --broadcast            # Foundry
```

Both default to Anvil's first dev key. Set `RPC_URL` and `PRIVATE_KEY` for other
networks, and never commit real keys.

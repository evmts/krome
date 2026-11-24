## krome/contracts

Krome supports compiling contracts and scripts via importing directly into JavaScript using [tevm](https://tevm.sh)

```typescript
import {BankV1} from './BankV1.s.sol'
```

Doing this compiles the contract into [an object with contract bytecode and abi](https://tevm.sh/learn/contracts/) called a Tevm Contract.

This can be useful especially when optimizing [clientside latency](https://tevm.sh/why/avoid-waterfalls/)

## Files

- [BankV1.s.sol](./BankV1.s.sol) an example contract. It is intentionally insecure: passwords live in public storage.
- [BankV1.spec.ts](./BankV1.spec.ts) exploits the bank in TypeScript with a Tevm memory client.
- [BankV1.bench.ts](./BankV1.bench.ts) benchmarks deploy and calls on Tevm.
- [test/BankV1.t.sol](./test/BankV1.t.sol) Foundry unit and fuzz tests (`forge test`).
- [script/DeployBankV1.s.sol](./script/DeployBankV1.s.sol) Foundry deploy script.
- [deploy.ts](./deploy.ts) deploys with viem using Tevm-compiled bytecode (`pnpm contracts:deploy`).

## Foundry

`foundry.toml` at the repo root points Foundry at this folder. Tests declare the
cheatcodes they use in [test/Vm.sol](./test/Vm.sol), so no `forge-std` submodule
is needed.

```bash
forge test                 # unit + fuzz (1,000 runs; FOUNDRY_PROFILE=ci uses 5,000)
anvil &
forge script contracts/script/DeployBankV1.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
pnpm contracts:deploy      # same deployment through viem
```

Use BankV1.spec.ts for an example of how to both import solidity into typescript as well as execute the solidity in a local VM using Tevm.
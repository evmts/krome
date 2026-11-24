[![CI](https://github.com/evmts/krome/actions/workflows/ci.yml/badge.svg)](https://github.com/evmts/krome/actions/workflows/ci.yml)

# Krome - Native Blockchain Apps Made Simple

Build blazingly fast, tiny blockchain applications that run natively on all major desktop and mobile platforms.

## What is Krome?

Krome is a framework for building blockchain applications that compile to tiny, native binaries for all major platforms. By leveraging Rust and advanced optimizations, Krome apps are typically under 10MB in size while delivering unmatched performance. It combines the best of modern development tools and frameworks:

- **[Tauri](https://tauri.app)** for secure native cross-platform applications
- **[Svelte 5](https://svelte.dev)** for performant, intuitive UI development
- **[TEVM](https://tevm.sh)** for Ethereum Virtual Machine integration
- **[Helios](https://github.com/a16z/helios)** for trustless light client capabilities
- **[Foundry](https://getfoundry.sh)** for Solidity testing and deployment

What sets Krome apart is its uncompromising focus on both user experience and developer productivity. Through its opinionated framework, it delivers a polished, native feel for users while maximizing development speed and maintainability for developers.

## ✨ Features

- 🖥️ **True Native Performance**: Build once, run anywhere with [Tauri](https://tauri.app)'s native capabilities
- 🔗 **Blockchain-Ready**: Pre-configured with [TEVM](https://tevm.sh) for seamless blockchain integration
- 🔄 **Multi-Language Support**:
  - [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)/[TypeScript](https://www.typescriptlang.org)
  - [Rust](https://www.rust-lang.org)
  - [Solidity](https://soliditylang.org)
- 🎨 **Performant UI**:
  - Faster than React-based alternatives
  - Intuitive for blockchain and systems developers
  - Simple, declarative syntax
- 📱 **Mobile First**: First-class mobile support out of the box
- 🔒 **Security First**:
  - [Tauri](https://tauri.app/v1/guides/security/security)'s security-focused architecture
  - Audited dependencies and minimal attack surface
- ⚡ **Optimistic Updates**: Built-in support for snappy UIs with optimistic operations
- 👛 **Wallet Integration**:
  - Wallet connection via [RainbowKit](https://rainbowkit.com) and [wagmi](https://wagmi.sh)
- 🧪 **Testing Ready**: Comprehensive testing setup for all supported languages

![image](https://github.com/user-attachments/assets/01666351-a2e6-4a09-879e-533a1f8ea06b)

## Requirements

- [Node.js](https://nodejs.org) 22.13 or later and [pnpm](https://pnpm.io) 11 (`corepack enable` picks the pinned version)
- [Rust](https://www.rust-lang.org/tools/install) stable and the [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/)
- [Foundry](https://getfoundry.sh) for `contracts/` (optional)
- For iOS development: [Xcode](https://developer.apple.com/xcode/) 15+ ([guide](./ios.md))
- For Android development: [Android Studio](https://developer.android.com/studio) Hedgehog+ ([guide](./android.md))

With [Nix](https://nixos.org), `nix develop` provides Node, pnpm, rustup, and Foundry.

## Quick Start

Start a new app from this template:

```bash
npx degit evmts/krome my-app   # or click "Fork" on GitHub
cd my-app
pnpm install
pnpm tauri dev                 # native window with hot reload
```

See [docs/getting-started.md](./docs/getting-started.md) for details and the [tauri 2.0](https://v2.tauri.app/) docs for Tauri specifics.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm tauri dev` / `pnpm tauri build` | Run or bundle the native app |
| `pnpm dev` / `pnpm build` | Run or build only the web frontend |
| `pnpm lint` | `svelte-check` type check, warnings fail |
| `pnpm test` | Unit and property (fast-check) tests, plus Tevm contract tests |
| `pnpm bench` | Vitest benchmarks |
| `pnpm test:e2e` | Playwright UI tests against the production build (Tauri IPC mocked) |
| `pnpm test:e2e:contracts` | Deploys to a real Anvil node with viem and `forge script` |
| `pnpm contracts:test` | Foundry unit and fuzz tests |
| `pnpm contracts:deploy` | Deploy `BankV1` with viem (`RPC_URL`, `PRIVATE_KEY`) |
| `cd src-tauri && cargo test` | Rust unit and property tests |

See [docs/testing.md](./docs/testing.md) for what each layer covers.

## File structure

App logic

- [src/](./src/) contains the Svelte app; routes live in [src/routes](./src/routes/)
- [src/lib/](./src/lib/) holds framework-free TypeScript: the typed Rust bridge, block polling, and input validation
- [src/react/](./src/react/) mounts React components (RainbowKit) inside Svelte
- Context to help your LLM write Svelte is in [src/svelte.llm.txt](./src/svelte.llm.txt)
- [src-tauri/](./src-tauri) contains the Rust code; commands are registered in [src-tauri/src/lib.rs](./src-tauri/src/lib.rs) and implemented in [src-tauri/src/helios.rs](./src-tauri/src/helios.rs)
- [contracts/](./contracts/) contains Solidity, Tevm tests, Foundry tests, and deploy scripts
- [e2e/](./e2e/) contains Playwright and Anvil end-to-end tests

Tauri specific files

- [src-tauri/tauri.conf.json](./src-tauri/tauri.conf.json) contains the [tauri config](https://v2.tauri.app/reference/config/)
- Additional configuration is in the capabilities file [src-tauri/capabilities](./src-tauri/capabilities/)

## Documentation

- [Getting started](./docs/getting-started.md)
- [Architecture](./docs/architecture.md)
- [Testing](./docs/testing.md)
- [Security](./SECURITY.md)
- [Contracts](./contracts/README.md)
- [iOS](./ios.md) and [Android](./android.md)

## Community

Join our community to get help, share your projects, and contribute:

- [Join Telegram](https://t.me/+ANThR9bHDLAwMjUx)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE)

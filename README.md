# Krome - Native Blockchain Apps Made Simple

Build blazingly fast, tiny blockchain applications that run natively on all major desktop and mobile platforms.

## What is Krome?

Krome is a framework for building blockchain applications that compile to tiny, native binaries for all major platforms. By leveraging Rust and advanced optimizations, Krome apps are typically under 10MB in size while delivering unmatched performance. It combines the best of modern development tools and frameworks:

- **[Tauri](https://tauri.app)** for secure native cross-platform applications
- **[Svelte 5](https://svelte.dev)** for performant, intuitive UI development
- **[TEVM](https://tevm.sh)** for Ethereum Virtual Machine integration
- **[Deno (TODO)](https://deno.land)** for secure JavaScript runtime
- **[Helios](https://github.com/a16z/helios)** (optional) for trustless light client capabilities

What sets Krome apart is its uncompromising focus on both user experience and developer productivity. Through its opinionated framework, it delivers a polished, native feel for users while maximizing development speed and maintainability for developers.

## ✨ Features

- 🖥️ **True Native Performance**: Build once, run anywhere with [Tauri](https://tauri.app)'s native capabilities
- 🔗 **Blockchain-Ready**: Pre-configured with [TEVM](https://tevm.sh) for seamless blockchain integration
- 🔄 **Multi-Language Support**: 
  - [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)/[TypeScript](https://www.typescriptlang.org)
  - [Golang](https://go.dev)
  - [Rust](https://www.rust-lang.org)
  - [Solidity](https://soliditylang.org)
- 🎨 **Performant UI**: 
  - Faster than React-based alternatives
  - Intuitive for blockchain and systems developers
  - Simple, declarative syntax
- 📱 **Mobile First**: First-class mobile support out of the box
- 🔒 **Security First**: 
  - [Deno](https://deno.land)'s secure-by-default runtime
  - [Tauri](https://tauri.app/v1/guides/security/security)'s security-focused architecture
  - Audited dependencies and minimal attack surface
- ⚡ **Optimistic Updates**: Built-in support for snappy UIs with optimistic operations
- 👛 **Wallet Integration**: 
  - Simple, secure wallet connection with broad provider support
  - Built-in embedded wallet support for seamless onboarding
  - Secure key management using the system's native keychain
- 🧪 **Testing Ready**: Comprehensive testing setup for all supported languages

## Requirements

- [Deno](https://deno.land/manual/getting_started/installation) 1.41 or later
- [Rust](https://www.rust-lang.org/tools/install) toolchain
- [Go](https://go.dev/doc/install) 1.22 or later
- [Node.js](https://nodejs.org) 20 or later (for npm packages)
- For iOS development: [Xcode](https://developer.apple.com/xcode/) 15+
- For Android development: [Android Studio](https://developer.android.com/studio) Hedgehog+

## Quick Start

```bash
pnpm install

# FIXME: This doesn't work yet
tauri dev
```

## Community

Join our community to get help, share your projects, and contribute:

- [Join Telegram](https://t.me/+ANThR9bHDLAwMjUx)

## TODO

### AI Slop
- [ ] Go through this TODO list and fix it since as of now it's purely ai generated

### Core Features
- [x] Add helios support
- [ ] Fix TypeScript/Svelte configuration and linting
- [ ] Create proper blockchain app starter page
- [ ] Add proper error handling and loading states for Helios
- [ ] Implement wallet connection UI components
- [ ] Add optimistic update helpers and hooks
- [ ] Create blockchain transaction queue management
- [ ] Add proper app state management

### Security & Performance
- [ ] Implement proper keychain integration for embedded wallets
- [ ] Add request caching layer
- [ ] Implement proper memory management for Helios
- [ ] Add proper error boundaries and recovery
- [ ] Create security audit checklist

### Developer Experience
- [ ] Add comprehensive TypeScript types for blockchain data
- [ ] Create component library for common blockchain UI patterns
- [ ] Add proper logging and debugging tools
- [ ] Create example smart contract integration
- [ ] Add automated testing setup
- [ ] Create deployment scripts and documentation

### Documentation
- [ ] Create comprehensive API documentation
- [ ] Add architecture diagrams
- [ ] Create step-by-step tutorials
- [ ] Document security best practices
- [ ] Add performance optimization guide
- [ ] Create troubleshooting guide

### Mobile Support
- [ ] Test and optimize iOS build
- [ ] Test and optimize Android build
- [ ] Add mobile-specific UI components
- [ ] Implement mobile-specific security features
- [ ] Add deep linking support

### Nice to Have
- [ ] Add block explorer integration
- [ ] Create transaction simulation preview
- [ ] Add ENS integration
- [ ] Create example NFT viewing component
- [ ] Add example DeFi integration patterns

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE)

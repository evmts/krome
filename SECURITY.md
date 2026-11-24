# Security

## Reporting a vulnerability

Do not open a public issue. Use GitHub's private vulnerability reporting on
this repository ("Security" tab, "Report a vulnerability").

## Audit guide

This section maps the attack surface so a reviewer can start in the right place.

### Trust boundaries

| Boundary | Code | Notes |
| --- | --- | --- |
| WebView → Rust IPC | `src-tauri/src/lib.rs`, `src-tauri/src/helios.rs` | Two commands: `start_helios`, `get_latest_block`. Arguments are user-controlled strings and a `u64`. |
| Tauri permissions | `src-tauri/capabilities/default.json` | `core:default`, `opener:default` for the `main` window only. |
| Rust → network | `helios.rs` | Execution RPC is untrusted; Helios verifies its data against the consensus light client. The consensus RPC and the initial checkpoint are trusted. |
| Rust → disk | `helios.rs` `data_dir` | Checkpoints in `<app data dir>/helios/<network>`. |
| WebView → network | RainbowKit / WalletConnect, RPC transports in `+page.svelte` | Third-party JS with network access. |

### Known risks and recommendations

1. **No Content Security Policy.** `tauri.conf.json` sets `"csp": null`. Any XSS
   in the WebView can call the IPC commands. Set a CSP before shipping, allowing
   only the RPC, WalletConnect, and font origins you use.
2. **Shared WalletConnect project ID.** `+page.svelte` ships a demo project ID.
   Replace it with your own; the demo ID can be rate-limited or revoked.
3. **Default RPC endpoints.** The defaults (`rpc.ankr.com`, `lightclientdata.org`)
   are public third-party services. The consensus RPC is a trust anchor for
   Helios; choose one you trust or run your own.
4. **Unbounded RPC URLs.** `start_helios` accepts any URL. The frontend checks
   for `http(s)`, but a compromised WebView can bypass it. Rust-side validation
   of scheme and host is recommended for production.
5. **Helios is pinned by git revision.** `Cargo.toml` tracks the `master` branch;
   `Cargo.lock` pins the revision. Review the diff before `cargo update -p helios`.
6. **`contracts/BankV1.s.sol` is intentionally insecure.** It stores passwords
   in public storage. `contracts/BankV1.spec.ts` and
   `contracts/test/BankV1.t.sol` demonstrate the exploit. Do not deploy it.
7. **Dev keys.** Deploy scripts default to Anvil's well-known first key. Never
   use it outside a local node.

### Dependency hygiene

- `pnpm-workspace.yaml` allows install scripts only for `esbuild`.
- Run `pnpm audit` and `cargo audit` (in `src-tauri/`) before releases.
- `viem` is pinned to 2.46.0 through a pnpm override: published tevm
  (<= 1.0.0-next.149) imports a chain viem 2.46.1 removed. Remove the override
  once a tevm release built from current tevm `main` is published.
- As of 2026-11-24, `pnpm audit` reports 2 critical and 19 high advisories, down
  from 4 critical and 48 high. The criticals are `tinypool`, reached through
  `vitest`, which published `@tevm/memory-client` lists as a runtime
  dependency (fixed on tevm `main`, not yet released). Test-runner code is not
  part of the app bundle. The SvelteKit advisories cover server features
  (remote functions, form actions) that a static Tauri SPA does not run.

# agent-lock

A CKB lock script that authorizes cell spending via **off-chain ECDSA signature verification** - enabling AI agents to cryptographically control on-chain assets through a Web2-to-Web3 bridge.

## How It Works

The lock script embeds a trusted Agent's **Blake160 public key hash** in its `args`. To spend a cell:

1. The spender constructs a transaction and computes its static hash
2. The Agent (off-chain) signs the transaction hash using its secp256k1 private key
3. The 65-byte signature (64 bytes compact + 1 byte recovery ID) is placed in the witness `lock` field
4. The on-chain script recovers the public key from the signature, hashes it via Blake2b-160, and compares it to the trusted hash in `args`

If the hashes match → authorization granted. The cell can be spent without any standard CKB private key.

## Architecture

```
                    ┌──────────────────────────┐
                    │   Off-Chain Agent Key    │
                    │  (secp256k1 private key) │
                    └──────────┬───────────────┘
                               │ signs tx_hash
                               ▼
┌──────────────────────────────────────────────────┐
│  CKB Transaction                                 │
│  ┌────────────────┐  ┌────────────────────────┐  │
│  │ cellDeps[0]   │  │ witnesses[0].lock     │  │
│  │ → agent-lock  │  │ → 65-byte ECDSA sig  │  │
│  │   RISC-V bin  │  │                        │  │
│  └────────────────┘  └────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │ Lock Script args: Agent's Blake160 pubkey  │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

## Script Return Codes

| Code | Meaning |
|------|---------|
| `0` | Success - authorized agent signed this transaction |
| `-1` | Error reading lock script |
| `-2` | Invalid script args length (must be 20 bytes) |
| `-3` | No witness provided |
| `-4` | Witness missing lock field |
| `-5` | Invalid signature length (must be 65 bytes) |
| `-6` | Error loading transaction hash |
| `-7` | Invalid signature format |
| `-8` | Invalid recovery ID |
| `-9` | Failed to recover public key |
| `-10` | Unauthorized - recovered key does not match trusted hash |

## Building

```bash
# Ensure RISC-V target is installed
rustup target add riscv64imac-unknown-none-elf

# Build with atomic instruction stripping (required for CKB-VM v2)
make build

# Run unit tests
cargo test

# Run integration tests (requires compiled binary at build/release/agent-lock)
MODE=release cargo test
```

## Deploying

Use the deploy script from the experiments directory:

```bash
cd experiments/agent-lock
npm run deploy
```

Update the generated `code_hash` and `tx_hash` in `experiments/agent-lock/config.ts` before running the server or spend scripts.

## Dependencies

- `ckb-std` - CKB standard library for syscalls
- `k256` - secp256k1 elliptic curve (no_std, ECDSA feature)
- `blake2b-ref` - Blake2b hashing with CKB personalized config

## Atomic Instruction Note

CKB-VM does not support RISC-V atomic instructions (`lr`, `sc`, `amo` prefixes). The Makefile disables the `+a` target feature flag so the compiler emulates atomics with single-threaded fallbacks. This is safe because CKB-VM is strictly single-threaded.

---

*Bootstrapped with [ckb-script-templates](https://github.com/cryptape/ckb-script-templates).*

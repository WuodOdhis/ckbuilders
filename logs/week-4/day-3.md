# Day 3: Implementing Cryptographic SECP256K1 Signature Recovery for Production Agent Lock

**Date:** May 20, 2026

## Objective
Upgrade the **Agent Lock** from a basic "secret code" model (vulnerable to frontrunning) to a production-grade, cryptographically secure **Web2-to-Web3 bridging lock** using `secp256k1` ECDSA signature recovery in Rust.

---

## Technical Accomplishment: On-Chain Signature Recovery

Instead of matching a plaintext secret code, the spending transaction must now present a **65-byte ECDSA signature** in the witness `lock` field. The on-chain Rust contract recovers the signer's public key from the transaction hash and the signature, hashes it, and verifies it matches the trusted Agent's public key hash in the lock's `args`.

### 1. Integrating `k256` and `blake2b-ref`
To run cryptography purely in the CKB-VM `no_std` environment, we added lightweight, audited pure-Rust cryptographic libraries in our contract's `Cargo.toml`:
```toml
[dependencies]
ckb-std = "1.1"
blake2b-ref = { version = "0.3.1", default-features = false }
k256 = { version = "0.13", default-features = false, features = ["ecdsa"] }
```

### 2. VM Signature Verification Logic
In `src/main.rs`, we implemented the following signature verification sequence:
1. **Load Transaction Hash:** Load the static 32-byte Blake2b hash of the current transaction (`load_tx_hash()`).
2. **Parse Signature & Recovery ID:** Extract the 64-byte compact signature and the 1-byte recovery ID from the 65-byte witness lock.
3. **Recover Public Key:** Use `VerifyingKey::recover_from_prehash` to derive the signer's public key from the transaction hash and signature.
4. **Derive Blake160 Hash:** Hash the 33-byte compressed public key using CKB's standard Blake2b configuration (`ckb-default-hash` personalization) and truncate it to the first 20 bytes (Blake160).
5. **Compare & Authenticate:** Validate that the recovered public key hash matches the trusted Agent's hash stored in the lock `args`.

---

## Step-by-Step E2E Testing & Success

### 1. Compiling & Deploying the Secure Lock
With atomic instruction stripping (`-C target-feature=-a`) successfully configured, the contract compiled into a completely atomic-free RISC-V binary (binary size: `416` KB) and was deployed to the local devnet:
- **Code Hash:** `0xd352ef2ab642c484ee3133f2adfb838b7dd256a59c2d3313e84e0d04658e9fe7`
- **Deployment Transaction Hash:** `0x054429802dffccb19cfcddb8811ed89f3768179d0bc6dedcd50bf5878fb74424`

### 2. E2E Spend Script with Raw Signature Bypass
We wrote a unified TypeScript test script in `/experiments/agent-lock/spend.ts` to simulate the full Web2 check and off-chain signature authorization:
1. **Derive Trusted Agent Hash:** Extract the 20-byte Blake160 hash `0x7ce5623e64f6ae7dac70a50e9dea03f898a103f4` from the Agent's secure private key.
2. **Lock Funds:** Fund a custom address locked by the signature-verifying lock script using the Agent's public key hash.
3. **Mock Web2 Telegram Check:** Perform mock Telegram Channel admin verification on the Agent server.
4. **Raw Signature Generation:** To bypass standard CKB message prefixing (which blocks signing raw tx hashes), we utilized CCC's internal `_signMessage` raw signing hook to sign the 32-byte `txHash` directly.
5. **Spend Success:** Injected the raw 65-byte signature into the transaction witness. The transaction was successfully verified and mined by the devnet node!

**Success Spend Transaction Hash:** `0x5aca1776e78202d4f89b490f5fab3e10534b4ea0473a2ca8e8567016397fe32e`

---

## Technical Insights & Discoveries
- **Raw Signing Bypass:** Standard wallet `signMessage` implementations prepend a prefix string (e.g. `\x18Nervos Message:\n<length>`) before signing for safety. For trusted machine-to-machine bridging locks, utilizing raw signature operations via `_signMessage` ensures compatibility with low-level VM verification.
- **Pure-Rust Elliptic Curve Performance:** Statically compiling `k256` is highly viable and extremely developer-friendly, stripping out complex dynamic loading logic while remaining well within single-transaction cycle boundaries.

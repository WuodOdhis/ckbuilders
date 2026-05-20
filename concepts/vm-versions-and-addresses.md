# CKB-VM Versions & Address Derivation

## 1. CKB-VM Versions (`hash_type`)
When defining a script on CKB, the `hash_type` field dictates which version of the **CKB Virtual Machine** executes the code:

- **`hash_type: "data"`**: Executes via **CKB-VM Version 0**. This is the legacy VM with strict memory mapping rules.
- **`hash_type: "data1"`**: Executes via **CKB-VM Version 1**. Includes the RISC-V `B` extension (bit manipulation) and relaxed memory rules.
- **`hash_type: "data2"`**: Executes via **CKB-VM Version 2**.

**Note:** Modern Rust contracts (using `ckb-std`) require CKB-VM v1 or v2. Deploying a modern Rust binary with `hash_type: "data"` will cause a `MemWriteOnExecutablePage` error. Always use `data1` or `data2`.

## 2. Address Derivation Pipeline
On CKB, an address is a serialized Smart Contract (Lock Script), not just a hashed public key.

The CCC SDK derivation pipeline:
1. **Private Key:** 32-byte secret.
2. **Public Key:** Derived via `secp256k1`.
3. **Public Key Hash:** Hashed via `Blake2b` and truncated to 160 bits.
4. **Lock Script:** The hash is injected into the `args` of the standard Secp256k1 Lock Script.
5. **Bech32m Encoding:** The Lock Script (`code_hash`, `hash_type`, `args`) is compressed into the Bech32m string format with a `ckt` or `ckb` prefix.

---

*Documented during Week 4, Day 1 of the CKBuilders program.*

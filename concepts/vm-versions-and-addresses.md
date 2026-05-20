# CKB-VM Versions & Address Derivation

*Technical learnings from Week 4, Day 1 script deployments.*

## 1. CKB-VM Versions (`hash_type`)

When defining a Lock Script or Type Script on CKB, you must specify a `hash_type`. This field does more than just determine how the script is hashed—it dictates which version of the **CKB Virtual Machine (CKB-VM)** will be used to execute the code.

As the Nervos network upgrades, new features (like RISC-V extensions for cryptography or vector operations) are added to the VM. To ensure backward compatibility, older scripts continue to run on the legacy VM, while new scripts can opt into the new VM.

* **`hash_type: "data"`**: Executes the script using **CKB-VM Version 0**. This is the legacy VM from the network's launch. It has stricter memory mapping rules.
* **`hash_type: "data1"`**: Executes the script using **CKB-VM Version 1**. This VM includes the RISC-V `B` extension (bit manipulation) and relaxed memory rules. 
* **`hash_type: "data2"`**: Executes the script using **CKB-VM Version 2** (introduced in a later hardfork).

**The `MemWriteOnExecutablePage` Error:**
Modern Rust toolchains (like the ones used in `ckb-std`) compile code assuming CKB-VM Version 1 or 2 is available. If you deploy a modern Rust binary but set `hash_type: "data"`, the legacy VM v0 will crash with a `VM Internal Error: MemWriteOnExecutablePage` because it considers certain memory segments read-only, whereas the compiled code assumes they are writable. 

**Always use `data1` or `data2` for modern Rust contracts.**

---

## 2. The Address Derivation Pipeline

On Ethereum or Bitcoin, an address is just a hashed public key. On CKB, an address is a **serialized Smart Contract (Lock Script)**.

Here is the exact technical pipeline the CCC SDK uses to convert a Private Key into a CKB address:

1. **Private Key:** A 256-bit scalar (32 bytes).
2. **Public Key:** Derived via `secp256k1` elliptic curve multiplication.
3. **Public Key Hash:** The public key is hashed using `Blake2b`, and truncated to 160 bits (20 bytes).
4. **Lock Script Construction:** 
   The public key hash is injected into the `args` of the standard Secp256k1 Lock Script.
   ```json
   {
     "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
     "hash_type": "type",
     "args": "0x[PUBLIC_KEY_HASH]"
   }
   ```
5. **Bech32m Encoding:** 
   The entire JSON object above is compressed and encoded using the `Bech32m` standard. The prefix `ckt` is added for testnet/devnet, or `ckb` for mainnet.

**The result is your address:** `ckt1qzda0cr...`

Because an address is just an encoded script, you can replace the `code_hash` with a pointer to a WebAuthn script, a multisig script, or an AI agent script, encode it, and generate a completely valid, standard CKB address with entirely custom security logic.

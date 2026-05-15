# CKB-VM: The RISC-V Powerhouse

The CKB-VM is the heart of the Nervos Network. It is a general-purpose execution environment based on the **RISC-V** instruction set.

## 1. Why RISC-V?

Most blockchains use a high-level, custom-built VM (like the EVM). CKB chooses to go "closer to the metal." By using RISC-V, CKB gains several massive advantages:

- **Language Flexibility:** Developers aren't restricted to a single language like Solidity. You can write scripts in **Rust, C, C++, Zig**, or even run **JavaScript** and **Lua** inside the VM.
- **Tooling Support:** Because RISC-V is a standard used in real-world hardware, CKB benefits from decades of compiler research (LLVM, GCC).
- **Future-Proofing:** If a new cryptographic primitive (like Post-Quantum Cryptography) is invented, it can be implemented as a CKB script immediately without a protocol upgrade.

## 2. The Abstraction Layer

In CKB, everything is a script. There are two main types:

1. **Lock Script:** Defines *who* can spend a cell. (Ownership)
2. **Type Script:** Defines *how* the data in a cell can be modified. (Logic/Rules)

Unlike other chains, **CKB does not have a native signature scheme.** The standard Secp256k1 signature verification that we use for "normal" addresses is actually just a RISC-V program stored in a cell. 

## 3. The Execution Model: Cycles

To prevent infinite loops and denial-of-service attacks, CKB-VM uses **Cycles**.

- **CPU Instructions:** Each RISC-V instruction has a fixed cycle cost.
- **Memory Access:** Accessing memory also costs cycles.
- **Predictability:** Because the VM is low-level and deterministic, the same code will always cost the same number of cycles, regardless of when it's run.

## 4. Comparison: EVM vs. CKB-VM

| Feature | EVM (Ethereum) | CKB-VM (Nervos) |
|---|---|---|
| **Architecture** | Stack-based (High-level) | Register-based (Low-level RISC-V) |
| **Languages** | Solidity, Vyper | Rust, C, JS, Zig, etc. |
| **Cryptography** | Hardcoded Precompiles | Fully Programmable Scripts |
| **Upgradeability** | Requires Hard Forks | Deploy New Script Cells |
| **Cost Model** | Gas (Variable) | Cycles (Deterministic) |

---

*Documented during Week 3, Day 2 of the CKBuilders program.*

# Week 3, Day 3: Script Architecture & Modern Scaffolding

## Objective
Begin the transition to the "Intermediate" track by understanding the CKB-VM and setting up the environment for custom script development.

## Progress Overview
Today, we compressed the foundations of script development into a single session. We explored how CKB's virtual machine works and prepared our toolchain for building the rules of the network.

### 1. The CKB-VM & RISC-V
We learned that the CKB-VM is a generalized virtual computer based on the **RISC-V** instruction set. This is a massive departure from the EVM:
- **No Hardcoding:** Cryptography is not built-in; it's just code you run in the VM.
- **Cycles:** Instead of gas, we measure CPU instructions. It is perfectly deterministic and predictable.

### 2. Modern Tooling: `ckb-script-templates`
Following the updated Handbook guidance, we skipped the deprecated `Capsule` tool and moved to the official Rust-based **`ckb-script-templates`**.
- We scaffolded a new project: **`always-success`**.
- We explored the anatomy of a Rust script (`#![no_std]`, `program_entry`, and returning `0` for success).

## Key Technical Insight
A script on CKB is simply a binary that returns `0` or an error. It doesn't "change state"; it **validates** that a proposed state transition (the transaction) follows the rules you've written in Rust.

## Next Week (Week 4)
Now that the Beginner track is complete and the toolchain is ready, we will spend Week 4 on:
1. **Compiling & Deploying** our first custom script.
2. **Generating Addresses** from our custom code hashes.
3. **Advanced Syscalls** (How scripts read transaction data).

---

## Screenshots

### The Always-Success Script — Rust Source Code
The anatomy of a minimal CKB script: `#![cfg_attr(target_arch = "riscv64", no_std)]`, `program_entry!`, and returning `0` for success:

![Always Success Code](screenshots/always-success-code.png)

### Building the RISC-V Binary
Running `make build` to compile the Rust script to a RISC-V binary. Encountered network timeouts downloading `rust-std` for the `riscv64imac-unknown-none-elf` target:

![RISC-V Build Process](screenshots/risc-v-build.png)

### Cargo Downloading CKB Crates
The full CKB SDK dependency tree being pulled — `ckb-hash`, `ckb-script`, `ckb-types`, and more:

![Cargo CKB Crates](screenshots/cargo-ckb-crates.png)

---

*Week 3 complete. 3 days, 5 hours, 100% handbook alignment.*

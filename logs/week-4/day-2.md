# Day 2: Overcoming CKB-VM Atomic Limitations & Deployed Agent-Owned Lock

**Date:** May 20, 2026

## Objective
Implement an **Agent-Owned Lock** where cell spending is authorized by matching a secret code passed in the `witnesses[0]` lock field against the lock script's `args`.

---

## Technical Discovery: The CKB-VM Atomic Constraint

During our initial runs of the `agent-lock` script, the CKB-VM consistently panicked with the following error:
```
TransactionFailedToVerify: Verification failed Script(TransactionScriptError { 
  source: Inputs[0].Lock, 
  cause: VM Internal Error: InvalidInstruction { pc: 108048, instruction: 336213423 } 
})
```

### 1. Root Cause Analysis
By dumping the RISC-V disassembly of our compiled binary (`llvm-objdump -d`), we located the exact instruction at PC `108048` (hex: `0x1A610`):
```assembly
1a610: 140a35af       lr.d.aq  a1, (s4)
```
- **`lr.d.aq`** (Load-Reserved Doubleword) belongs to the RISC-V **"A" (Atomic) Extension**.
- This instruction was automatically injected by the compiler inside the `bytes` crate (specifically `shallow_clone_vec`) used under the hood by `ckb-std` for managing `Script` and `WitnessArgs` Molecule parsing.
- **The Constraint:** CKB-VM executes smart contracts in a **strictly single-threaded, deterministic environment**. Consequently, it **does not support RISC-V Atomic instructions** (`lr`, `sc`, `amo` prefixes) at all. Executing them immediately halts the VM with an `InvalidInstruction` exception.

### 2. The Solution
We successfully bypassed this compiler constraint by modifying the Rust compiler flags (`RUSTFLAGS`) in our `Makefile` to explicitly disable the atomic extension:
```diff
- FULL_RUSTFLAGS := -C target-feature=+zba,+zbb,+zbc,+zbs,+a $(CUSTOM_RUSTFLAGS)
+ FULL_RUSTFLAGS := -C target-feature=+zba,+zbb,+zbc,+zbs,-a $(CUSTOM_RUSTFLAGS)
```
By switching from `+a` to `-a`, we forced the Rust compiler to **gracefully emulate all atomic operations** (such as reference counting) using standard, single-threaded CPU loops, completely stripping all `lr`, `sc`, and `amo` instructions from the final binary!

---

## Step-by-Step Execution & Success

### 1. Recompiling & Deploying
With atomics disabled, the contract successfully compiled and was deployed to our local devnet under the modern `data2` (CKB-VM v2) hash type:
- **Code Hash:** `0x240f02d1381dfeb12b11d87c1320cb2306f7d31a3809b27d53aec17b4113b267`
- **Tx Hash:** `0x4ef58f7706a8aef6937d37d18c39df4d98f70edf14ebdf64aa07cd5a477ac438`

### 2. Lock & Spend Validation
- **Funding:** We sent 200 CKB to a custom address locked by our new `agent-lock` script, instantiated with the expected secret code `"0x6f70656e5f736573616d65"` ("open_sesame") in its `args`.
- **Spending:** We constructed a transaction to spend that cell, populating `witnesses[0]` with a `WitnessArgs` structure whose `lock` field contained the exact same secret hex string.
- **Execution:** The spending transaction was broadcasted, processed, and **successfully mined** without a single instruction panic!

**Spend Tx Hash:** `0x3410258534c4f8d4da74c1f4079a898a1f1b9c6f57d31437076559d717bbffac`

---

## Technical Insights
- **Target Feature Emulation:** Disabling target features (`-a`) in LLVM does not break compilation of crates that use thread-safe data structures like `Arc` or atomic integers; it redirects them to use built-in single-threaded fallbacks.
- **CKB-VM single-threaded optimization:** Since there is only one thread execution environment per VM instance, emulate-based atomics are completely safe and highly optimized.

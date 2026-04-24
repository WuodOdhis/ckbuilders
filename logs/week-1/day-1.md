# Day 1: Laying the Foundations — OffCKB & The Cell Model

**Date:** April 23, 2026  
**Phase:** 1 (Setup & Fundamentals)  
**Objective:** Transition from an Account-based mindset (Ethereum) to a Cell-based architecture (CKB) while setting up a local development environment.

---

##  Environment Setup: The OffCKB Experience

Setting up CKB isn't just about running a binary; it's about initializing a flexible PoW environment. Using **OffCKB**, I've spun up a local Devnet.



### ⚡ Commands for the Log
```bash
# Initialize the developer workspace
offckb init

# Launch the local Devnet (RPC on :8114, Proxy on :28114)
offckb node

# View pre-funded developer accounts
offckb accounts
```

---

##  Conceptual Shift: Cells vs. Accounts

Today's biggest "Aha!" moment was internalizing the **Cell Model**.

| Feature | Ethereum (Account Model) | CKB (Cell Model) |
| :--- | :--- | :--- |
| **State Storage** | Global State Tree (Centralized) | Individual Cells (Decentralized) |
| **Ownership** | Balance tied to an Address | Cell tied to a "Lock Script" |
| **Concurrency** | Sequential (Nonce-based) | Parallel (UTXO-based) |
| **Computation** | On-chain (EVM) | Off-chain (Verification on-chain) |

### Why this matters for Scalability & Ownership
In an Account-based world, you are restricted by a sequential `nonce`. In CKB's **Cell-oriented** world:
1. **Granularity:** State is fragmented into independent cells, allowing for highly specific data management.
2. **Parallelism:** Transactions can be processed in parallel because they reference independent cells rather than a shared global state.
3. **True Ownership:** Data resides directly in the cells you own, not in a central contract's storage.

---

##  First Transaction: Transferring CKB

*Successfully verified the local RPC connection and performed the first transfer of 100 CKB between dev accounts.*

---

##  Reflection for Day 1
The shift to PoW + UTXO feels like moving from a shared database (Ethereum) to a fleet of independent, programmable safety deposit boxes (CKB). It provides a level of control and scalability that is essential for complex decentralized applications.

**Next Step:** Mastering the `Script` logic—how to actually lock and unlock these boxes.

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

### Why this matters for AI Agents
In an Account-based world, an agent is restricted by its `nonce`. It can only do one thing at a time. In CKB's **Cell-oriented** world:
1. **Granularity:** An agent can own 1,000 different cells, representing 1,000 different sub-tasks or micro-payments.
2. **Parallelism:** The agent can sign and broadcast 1,000 transactions simultaneously without them blocking each other.
3. **Data Residency:** We don't just store "balances." We store *data* inside the cells. This means an agent's memory can live directly in a cell it owns.

---

##  First Transaction: Transferring CKB

*In progress: Verifying the local RPC connection and performing the first transfer of 100 CKB between dev accounts.*

---

##  Reflection for Day 1
The shift to PoW + UTXO feels like moving from a shared database (Ethereum) to a fleet of independent, programmable safety deposit boxes (CKB). For autonomous agents that need to act fast and own their own data, the Cell model feels like the "correct" architecture.

**Next Step:** Mastering the `Script` logic—how to actually lock and unlock these boxes.

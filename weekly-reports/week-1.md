# Week 1 Report: Infrastructure & Core Paradigms

**Period:** April 23 – 26, 2026  
**Focus:** Transitioning from account-based development to cell-oriented architecture, establishing the local development environment, and internalizing the fundamental building blocks of the Nervos CKB ecosystem.

---

## Executive Summary

Week 1 was entirely foundational. The goal was not to build applications, but to deeply understand what makes CKB fundamentally different from every other blockchain. By the end of the week, the shift from thinking in "balances and addresses" to thinking in "cells and scripts" was complete. Every subsequent week of development builds on this mental model.

---

## Daily Breakdown

### Day 1 - Environment Setup & The Cell Model

**Objective:** Spin up a local devnet and internalize the core state model.

The first milestone was getting `offckb` , CKB's local developer toolchain , running and configured. Unlike Ethereum's Hardhat or Foundry, `offckb` initializes a fully functional Proof-of-Work node locally, which means blocks are actually mined and transactions must be genuinely verified.

The core conceptual shift was understanding the **Cell Model** — CKB's version of Bitcoin's UTXO model but significantly more expressive:

| Concept | Ethereum | CKB |
|---|---|---|
| State Storage | Global shared ledger | Individual isolated cells |
| Ownership | Address balance | Lock Script on a cell |
| Concurrency | Sequential (nonce-gated) | Parallel (UTXO-style) |
| Computation | On-chain (EVM execution) | Off-chain computation, on-chain verification |

**Key Insight:** In CKB, you do not have a "balance." You own a collection of cells, and the sum of their capacities is your spendable CKB. This distinction has enormous implications for parallelism, privacy, and composability.

**Completed:** OffCKB node running, CKB Academy theoretical course completed, first local transfer executed.

---

### Day 2 - Transaction Construction & Token Transfers

**Objective:** Move beyond reading docs and write the first real transaction.

We constructed a raw CKB token transfer boilerplate. This exercise forced a practical understanding of how transactions are built on CKB:
- Gathering **Input Cells** (cells to consume)
- Specifying **Output Cells** (new cells to create)
- Attaching a **Witness** (the cryptographic proof of authorization)

The key realization: CKB transactions do not "move" tokens. They **destroy** old cells and **create** new ones. This is not just a technical distinction - it means state on CKB is never mutated, only transformed.

**Completed:** Full CKB transfer boilerplate implemented and verified on the local devnet.

---

### Day 3 - CKB-VM & The RISC-V Advantage

**Objective:** Understand why the choice of Virtual Machine defines the long-term potential of the network.

Studied and compared the four major blockchain VMs:

| VM | Chain | Instruction Set | Key Limitation |
|---|---|---|---|
| EVM | Ethereum | Custom 256-bit stack | Requires hard forks for new crypto |
| WASM | Polkadot/Near | Web Assembly | External standard dependency |
| SVM | Solana | eBPF (modified) | Optimized for throughput, limited flexibility |
| **CKB-VM** | **Nervos** | **RISC-V** | **None, it's a hardware standard** |

**Key Insight:** Because RISC-V is an open hardware instruction set (not a blockchain-specific design), any cryptographic library that compiles to RISC-V can be deployed as a CKB script without a protocol upgrade. This means CKB can support post-quantum cryptography, new ZK-proof systems, or any future standard by simply deploying a new script - no hard fork required.

**Completed:** Full comparative analysis documented. Understood why "Bring Your Own Crypto" is a superpower.

---

### Day 4 - Lock Scripts & Type Scripts

**Objective:** Understand the programmable logic layer of the Cell Model.

Every cell in CKB has two optional logic fields that define its rules:

**Lock Script (Security Layer):** Answers the question *"Who is authorized to spend this cell?"* It runs when a cell is consumed as an input. The standard lock (`Secp256k1Blake160`) checks for a valid ECDSA signature. But this is completely programmable - you can build multi-sig, time-locked, or social-recovery locks.

**Type Script (Constraint Layer):** Answers the question *"Are the rules of this asset being followed?"* It runs on both the input and output cells. This is how token minting rules, NFT uniqueness, and DAO governance are enforced without a central contract.

```typescript
// How we reference a deployed lock script in code
const myLockScript = {
  codeHash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  hashType: "type",
  args: "0x..." // My public key hash
};
```

**Key Insight:** "Ownership" in CKB is not a database record - it is a *program*. You can upgrade your security model without touching the chain.

**Completed:** Full script anatomy documented. Set up the `day-4-asset-factory` React project to prepare for Week 2 frontend development.

---

## Key Technical Takeaways

1. **The Cell Model is not just Bitcoin's UTXO** - it is a fully programmable UTXO with separate security and constraint layers.
2. **RISC-V is a long-term bet on hardware standardization**, not a blockchain-specific gimmick.
3. **Every transaction is a state transformation**, not a state mutation. Old cells are destroyed; new cells are created.
4. **Ownership is a script.** This means the rules of who can access your assets are programmable, upgradable, and composable.

---

## Week 1 Completion Status

- [x] OffCKB local devnet configured and running
- [x] CKB Academy theoretical foundations completed
- [x] First CKB transfer executed on the devnet
- [x] CKB-VM vs. EVM analysis documented
- [x] Lock Script vs. Type Script mechanics internalized
- [x] React frontend scaffolded for Week 2

---

*Week 1 complete. The foundation is solid. Moving into practical application development in Week 2.*

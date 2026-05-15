# Week 1: Environment & Core Concepts

**Dates:** April 23 – 26, 2026

This week was all about getting the local environment running and wrapping my head around CKB's architecture. Coming from Ethereum, the shift to a UTXO-like model requires a complete rewiring of how I think about state.

## Progress & Setup
Got `offckb` running to spin up a local PoW devnet. It's much heavier than something like Hardhat, but it forces you to deal with actual block mining and verification right from the start.

Spent most of the time going through the CKB Academy docs to understand the fundamentals. Completed the first milestone by executing a raw 100 CKB transfer between dev accounts. Also scaffolded a basic React project (`day-4-asset-factory`) to serve as the frontend for next week's token experiments.

## The Cell Model
The biggest hurdle was internalizing that there are no "accounts" or "balances". Everything is a Cell.
- **State isn't mutated:** To change state, you destroy old cells and create new ones.
- **Parallelism:** Because cells are independent, transactions that don't touch the same cells can be processed concurrently.
- **Ownership:** It's defined by the `Lock Script`. If you can satisfy the script (usually with an ECDSA signature), you own the cell.

## CKB-VM
Looked into why Nervos chose RISC-V instead of building a custom VM like EVM or using WASM. It makes sense: RISC-V is a hardware standard. There are no precompiles for specific cryptography. If you want to use secp256k1, you compile a C implementation to RISC-V and deploy it as a script. If you want to use a post-quantum signature scheme tomorrow, you just deploy a new script. It future-proofs the execution layer.

## Scripts (Lock vs. Type)
- **Lock Script:** Defines *who* can spend the cell. Runs only when the cell is an input.
- **Type Script:** Defines *what* the cell represents and its state transition rules. Runs on both inputs and outputs. This is where token logic (like xUDT) lives.

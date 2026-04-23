# The CKB Cell Model: A Deep Dive for AI Developers

## What is a Cell?
A **Cell** is the basic unit of state in CKB. Think of it as a smarter version of a Bitcoin UTXO. While a Bitcoin UTXO only stores a balance, a CKB Cell can store:
- **Capacity:** The amount of CKB tokens (which also represents the storage space in bytes).
- **Data:** Any arbitrary bytes (compiled code, agent state, metadata).
- **Lock Script:** Defines who can "unlock" and spend the cell.
- **Type Script:** Defines the rules for how the cell's data can be transformed (the "logic").

## Account Model vs. Cell Model
AI agents often struggle with the **Account Model** (Ethereum) because of the sequential nature of transactions. If an agent wants to send 10 micro-payments, it must do so one by one (Nonce 1, then Nonce 2, etc.).

In the **Cell Model**:
- State is fragmented into independent pieces (Cells).
- Transactions consume old cells and create new ones.
- **Concurrency:** An agent can spend multiple cells in parallel. This is perfect for high-frequency agent actions or multi-agent systems where agents don't want to block each other.

## Why CKB for AI Agents?
1. **Off-chain Computation:** Agents can compute the new state of a cell locally and just submit the proof/transaction to the chain.
2. **First-Class Assets:** On CKB, you don't need a contract to manage your tokens. The cell itself *is* the asset, and you own it directly.
3. **Sustainable Storage:** To store data on-chain, you must lock CKB tokens. When you delete the data, you get the tokens back. This creates a "rent" model that is sustainable for long-running agents.

---
*Reference: CKB RFC 0019 - Data Structure*

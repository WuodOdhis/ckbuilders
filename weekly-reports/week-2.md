# Week 2 Report: Practical On-Chain Development & Layer 2 Architecture

**Period:** April 29 – May 4, 2026  
**Focus:** Moving from theory into hands-on transaction construction, token issuance, state architecture, and understanding CKB's Layer 2 payment channel network (Fiber).

---

## Executive Summary

Week 2 marked the transition from conceptual understanding to live on-chain execution. Every exercise required writing real TypeScript code, constructing raw transactions, and broadcasting them to a local devnet. The week covered four major milestones: storing arbitrary data on-chain, issuing a Fungible Token (xUDT), understanding CKB's unique state-rent model, and studying the Fiber Network - CKB's Layer 2 payment channel infrastructure.

---

## Daily Breakdown

### Day 1 - JoyID Wallet Integration & SDK Setup

**Objective:** Connect a live wallet to the project and establish the CCC SDK as the primary development toolkit.

The JoyID wallet was integrated into the `day-4-asset-factory` React project using the `@ckb-ccc/connector-react` package. Unlike MetaMask, JoyID uses **WebAuthn passkeys** (FaceID/TouchID) for transaction signing, meaning users never manage a seed phrase.

Key setup: The `ccc.Provider` component was wrapped around the entire application, giving all child components access to the wallet signer context. This pattern is the foundation for every dApp interaction in Week 2 and beyond.

**Completed:** JoyID wallet connected, CCC Provider configured, devnet client initialized.

---

### Day 2 - Storing Data on Cells & Minting a Fungible Token (xUDT)

**Objective:** Construct raw transactions that store data and mint tokens on the local devnet.

#### Part 1: Storing Arbitrary Data

The first practical exercise was writing a message - `"Building on CKB Devnet from scratch!"` - directly into the `outputsData` field of a new cell on-chain.

The critical technical challenge was **capacity calculation**. CKB enforces that every cell's `capacity` must exactly cover the bytes it occupies:

```typescript
// occupiedSize = Lock Script bytes only (~61 bytes)
// ccc.bytesFrom(dataHex).length = the data we are adding
tx.outputs[0].capacity = BigInt(tx.outputs[0].occupiedSize + ccc.bytesFrom(dataHex).length) * 100000000n;
```

The transaction was verified by querying the local RPC via `curl`, which returned the exact hex string of our stored message from the `outputs_data` field.

**Transaction Hash:** `0xf00c022b1cc843e89160f8a952e275cb6fe31c185a315f91fb6d53468415e272`

#### Part 2: Minting an xUDT Fungible Token

With data storage understood, we extended the same pattern to mint 1,000,000 units of a custom Fungible Token using the **xUDT (Extensible User Defined Token)** standard.

The four core mechanics applied:

| Step | Concept | Implementation |
|---|---|---|
| 1 | Token Amount | Stored as a 128-bit little-endian integer in the `data` field |
| 2 | Type Script | `xUDT` script attached to enforce transfer/minting rules |
| 3 | Owner Definition | Owner's Lock Script Hash set as the `args` of the Type Script |
| 4 | Cell Dependencies | xUDT script outpoint injected into `cellDeps` for verification |

```typescript
// Token amount format: 128-bit unsigned integer, little-endian
const dataBytes = ccc.numLeToBytes(1000000n, 16);

// The owner's lock hash becomes the token's identity
const ownerLockHash = ccc.hashCkb(ccc.Script.encode(addressObj.script));
```

**Token Minting Transaction Hash:** `0x6fb08580afb50f4b1a4d25f93ac5e00fca3582907ef48572d689064c375940ed`

**Key Debugging Discovery:** The CCC `ClientPublicTestnet` hardcodes testnet system script outpoints. On a fresh `offckb` devnet, these outpoints are different. This required cloning and patching the scripts configuration before constructing any transactions- a non-obvious but critical devnet gotcha.

---

### Day 3 - State Architecture Theory: CKB as Real Estate & The Spore Protocol

**Objective:** Understand CKB's state rent model and how it powers self-sustaining asset transfers.

#### The State Bloat Problem

On Ethereum, every deployed contract forces the entire network to store its ever-growing state table permanently and for free. This is "State Bloat" - a long-term threat to decentralization because it raises the hardware requirements to run a node.

#### CKB's Solution: 1 CKB = 1 Byte

CKB treats blockchain space as **physical real estate**. Every byte of on-chain data requires a proportional amount of CKB to be locked as a capacity deposit. When you no longer need the data, you destroy the cell and reclaim your CKB.

This elegantly solves state bloat: you only occupy the space you are willing to pay to hold.

#### The Spore Protocol: Self-Paying Assets

This model becomes extraordinary when applied to NFTs via the **Spore Protocol**. A Spore NFT stores its content (image, text, etc.) directly on-chain. Because 1 CKB = 1 Byte, the NFT literally contains CKB as its own structural material.

When transferring a Spore NFT, the sender can shave a microscopic amount of capacity from the NFT's own body to pay the miner fee. **The asset finances its own movement.** This enables sending digital assets to users with zero CKB in their wallets — a level of UX that is impossible on fee-separated blockchains.

---

### Day 4 - Fiber Network: CKB's Layer 2 Payment Architecture

**Objective:** Study how the Fiber Network extends CKB's capabilities to enable instant, high-throughput micro-payments.

#### What is the Fiber Network?

The Fiber Network is CKB's **Layer 2 payment channel network**, conceptually similar to Bitcoin's Lightning Network but built with CKB's unique script programmability. It enables two parties to open a payment channel by locking funds in a multi-sig cell on-chain, then transacting off-chain at unlimited speed - only settling to Layer 1 when the channel is closed.

#### How It Works

**1. Channel Opening:** Two parties create an on-chain "Funding Cell" secured by a 2-of-2 multi-signature Lock Script. Both parties' initial balances are committed here.

**2. Off-Chain Payments:** Transactions are signed and exchanged between the two parties but never broadcast to Layer 1. Each new payment creates a new "Commitment Transaction" that supersedes the last. Because both parties hold signed proofs at all times, neither can cheat.

**3. HTLC (Hashed Time-Lock Contracts):** For routing payments through multiple hops (Alice → Bob → Carol without Alice trusting Carol), the Fiber Network uses **HTLC cells**. A payment is locked by a hash, and the receiver reveals the preimage to claim it, atomically unlocking the route across all hops.

**4. Channel Closure:** Either party can broadcast the latest Commitment Transaction to Layer 1, splitting the channel's balance according to the most recent signed state. There is a dispute window during which the other party can challenge with a more recent state.

#### Why CKB's Script Model Makes Fiber More Powerful

On Bitcoin, HTLC logic is embedded in Bitcoin Script, which is limited. On CKB, the HTLC is a **Type Script** - a full RISC-V program. This means:
- **Cross-asset channels:** A single Fiber channel can carry CKB, xUDT tokens, or Spore assets simultaneously.
- **Programmable settlement:** Custom dispute resolution logic can be written in Rust and deployed without protocol changes.
- **RGB++-compatible routing:** Assets bridged from Bitcoin via RGB++ can be routed through Fiber channels, connecting Bitcoin's liquidity to CKB's programmability.

#### The Payment Gateway Model

From a developer perspective, the Fiber Network enables a **payment gateway** pattern:
- A merchant opens a Fiber channel with a liquidity hub.
- Customers pay instantly off-chain via the hub's routing network.
- The merchant settles to Layer 1 once per day (or week), paying a single on-chain fee instead of one per transaction.

This reduces the effective cost of micro-payments to near-zero and pushes throughput well beyond what Layer 1 can handle.

---

## Key Technical Takeaways for Week 2

1. **CKB capacity is a deposit, not a fee.** Storing data costs CKB that you can reclaim - this changes how you think about on-chain state entirely.
2. **The xUDT Type Script is the sole enforcer** of your token's minting and transfer rules. The owner's Lock Script Hash in the `args` field is your mint key.
3. **Devnet and Testnet are not the same environment** for CCC. System script outpoints must be manually patched when working locally.
4. **The Fiber Network extends CKB's programmability to Layer 2**, enabling cross-asset routing and instant settlement that Bitcoin's Lightning Network cannot support natively.

---

## Concepts Documented This Week

- `concepts/xudt.md` - xUDT token mechanics and the Type Script enforcement model
- `concepts/fiber-network.md` - Fiber Network architecture, HTLC design, and the payment gateway pattern

---

## Week 2 Completion Status

- [x] JoyID wallet integrated into the dApp
- [x] Data stored on-chain and verified via RPC
- [x] xUDT Fungible Token minted on the local devnet
- [x] State rent model and Spore Protocol internalized
- [x] Fiber Network payment channel architecture studied
- [ ] xUDT Transfer Script (next)
- [ ] Spore / DOB minting (next)
- [ ] Frontend UI for token operations (next)

---

*Week 2 complete. The gap between theory and production-grade on-chain development has been bridged.*

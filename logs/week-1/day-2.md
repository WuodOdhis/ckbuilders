# Day 2: The Art of the Transfer — Lumos & Transaction Construction

**Date:** April 24, 2026  
**Phase:** 1 (Setup & Fundamentals)  
**Objective:** Mastering transaction construction using the Lumos SDK and implementing a robust CKB transfer boilerplate.

---

##  Theoretical Deep Dive: Anatomy of a CKB Transaction

Unlike Ethereum where you just call `transfer(to, amount)`, CKB requires you to explicitly "construct" the state transition. A transaction is essentially a map that says: *"Take these existing cells (Inputs) and turn them into these new cells (Outputs)."*

### 1. Cell Selection (Coin Selection)
To send 500 CKB, we don't just "subtract" from a balance. We must find one or more "Live Cells" whose total capacity is ≥ 500 CKB + transaction fees.

### 2. The Change Mechanism
If I use a cell with 1000 CKB to send 500 CKB, I must create **two** output cells:
- **Target Cell:** 500 CKB for the recipient.
- **Change Cell:** 499.99 CKB (minus fees) back to myself.
*If you forget the change cell, the remaining CKB is given to the miner as a tip!* 

### 3. Witnesses & Signing
The **Witness** is where the signature lives. It proves that you have the right (via the Lock Script) to consume the input cells.

---

##  Practical Implementation: The Transfer Boilerplate

Using **Lumos**, I've implemented a reusable boilerplate for transferring CKB. This will serve as the foundation for agent micro-payments.

###  Core Snippet: Constructing the Transaction
```typescript
import { helpers, Indexer, RPC } from "@ckb-lumos/lumos";

// 1. Initialize the Indexer to find our cells
const indexer = new Indexer("http://127.0.0.1:8114");

async function transferCKB(fromAddress, toAddress, amountInCKB) {
  // Convert CKB to Shannons (1 CKB = 10^8 Shannons)
  const amount = BigInt(amountInCKB) * 100000000n;

  // 2. Transaction Skeleton
  let txSkeleton = helpers.TransactionSkeleton({ cellProvider: indexer });

  // 3. Add Transfer Logic
  txSkeleton = await helpers.transfer(txSkeleton, fromAddress, toAddress, amount);
  
  // 4. Add Change Cell (Fee handling)
  txSkeleton = await helpers.payFeeByFeeRate(txSkeleton, fromAddress, 1000n);

  // 5. Signing & Broadcasting
  // (Using simple-transfer dApp logic for rapid prototyping)
}
```

---

##  Proof of Work: Successful Transfer

Successfully executed a transfer of **99 CKB** using a custom dApp interface running on the local devnet.

###  Transfer Interface
The dApp successfully connected to the local node, identified the available capacity (42M CKB), and constructed the transaction.

![CKB Transfer UI](file:///home/badman/Projects/ckbuilders-log/logs/week-1/screenshots/day-2-transfer-ui.png)

###  Terminal Confirmation
The transaction was broadcast via the `simple-transfer` boilerplate, confirmed with hash:  
`0x6ad1ca2eb65347e494692e95d89cbbd3d5a448df073faae90b879b653924a11d`

![CKB Terminal Output](file:///home/badman/Projects/ckbuilders-log/logs/week-1/screenshots/day-2-terminal.png)

---

##  Reflection for Day 2
Constructing transactions manually feels more like "hardware programming" than "web development." You have to be mindful of every byte and every Shannon. For an AI agent, this level of control is a superpower—it can optimize its own "storage footprint" by merging or splitting cells dynamically.

**Next Step:** Exploring **Scripts** — moving from simple transfers to conditional logic (Lock Scripts).

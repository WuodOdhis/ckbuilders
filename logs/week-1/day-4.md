# Day 4: The Logic of Control — Lock & Type Scripts

**Date:** April 26, 2026  
**Phase:** 1 (Setup & Fundamentals)  
**Objective:** Understanding the programmable nature of CKB assets through Lock Scripts and Type Scripts.

---

##  What is a Script?

In CKB, "Smart Contracts" aren't account-bound programs. They are **Scripts** that reside within Cells. Every Cell has two critical logic fields:

### 1. The Lock Script (Who?)
The Lock Script is the "Ownership" layer. It answers the question: *Is the person trying to spend this cell authorized to do so?*
*   **Success:** Returns `0`. The cell is consumed, and its capacity moves to new cells.
*   **Failure:** Returns a non-zero error. The transaction is rejected.

### 2. The Type Script (What?)
The Type Script is the "Constraint" layer. It answers the question: *Are the rules of this asset being followed?*
*   It validates the state transition (e.g., "The total supply of tokens in the inputs must equal the total supply in the outputs").

---

##  Practical Exercise: Anatomy of a "Simple Lock"

If we were to build a "Simple Lock" (like a Hash Lock), the logic would look like this:

1.  **Arguments (Args):** The hash of a secret word.
2.  **Witness:** The secret word itself (provided by the user).
3.  **Validation:** 
    ```c
    // Pseudo-code logic in C/Rust for the VM
    if (hash(witness_data) == script_args) {
        return 0; // Success!
    } else {
        return 1; // Unauthorized!
    }
    ```

### Why this is powerful:
You can create a "Bounty Cell" where anyone who knows the secret can claim the funds, without needing a specific private key.

---

##  Scripts in the Workspace (Lumos/CCC Perspective)

When constructing transactions using Lumos or CCC, we don't always *write* the RISC-V code; we *reference* it.

```typescript
const myLockScript = {
  codeHash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8", // SECP256K1 hash
  hashType: "type",
  args: "0x..." // My public key hash
};
```

This structure is what I used in Day 2 to perform the transfer. The `codeHash` points to a pre-deployed "system script" that handles signature verification.

---

##  Closing Week 1: The Foundation is Set

We have covered the core pillars of CKB:
1.  **Day 1:** The Cell Model & OffCKB.
2.  **Day 2:** Transaction Construction & Transfers.
3.  **Day 3:** CKB-VM & RISC-V Flexibility.
4.  **Day 4:** Script Logic (Lock vs Type).

**Week 1 Takeaway:** CKB is not just a blockchain; it's a **modular storage and verification engine**. You own your data (Cells), you control who accesses it (Lock), and you define the rules of its evolution (Type).

---

##  Reflection for Day 4
Understanding that "Ownership" is just a script was the final piece of the puzzle. It means I can build multi-sig, social recovery, or time-locked accounts by simply changing the Lock Script, without waiting for protocol upgrades.

**Next Step:** Moving into **Week 2** to start building practical applications with **UDTs (User Defined Tokens)** and **Spores**.

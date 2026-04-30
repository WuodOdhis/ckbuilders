# xUDT (Extensible User Defined Token) on CKB

Unlike account-based blockchains (like Ethereum) where tokens are balances managed by a single central smart contract, the Nervos CKB utilizes the **Cell Model**. On CKB, a token is just physical data stored within a Cell that you personally own.

## Core Concepts

### 1. The Token is Just Data
At its core, an xUDT token is simply a Cell where the `data` field contains a 128-bit unsigned integer (a number). This number represents the amount of tokens that Cell holds. If you hold a Cell with `100` in the data field, you literally hold a "100-token bill".

### 2. The Type Script Enforces the Rules
If tokens are just numbers in a Cell, what stops someone from creating a Cell with `1,000,000` in the data field to make themselves rich?

This is solved by the **Type Script**. When a token is issued, a specific script called `xUDT` is attached to the Cell's Type field. This script enforces the "laws of physics" for the token:

*   **Minting Rules:** The Type Script's `args` define who the "Owner" is (usually referencing a specific Lock Script). Only the Owner is allowed to mint new tokens out of thin air.
*   **Transfer Rules:** When tokens are transferred, the xUDT script simply counts the tokens in the Input Cells and compares them to the Output Cells. As long as `Input Tokens == Output Tokens`, the transfer is allowed. The script ensures no tokens are magically created or destroyed during a transfer.

### 3. Absolute Ownership
Because tokens are physical Cells locked by your personal Lock Script, they cannot be frozen or seized by a central administrator. There is no central contract to hack or manipulate—your tokens are as secure as the native CKB token itself.

---

*This document was created as part of the CKBuilders Week 2 learning log.*

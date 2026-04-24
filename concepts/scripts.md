# Understanding CKB Scripts: The Logic of the Cell

In CKB, smart contracts are called **Scripts**. Every Cell contains two specific script fields that determine its behavior and ownership.

## 1. The Lock Script (Authentication)
The **Lock Script** is like a programmable lock on a safety deposit box. 
- **Purpose:** It determines *who* has the right to consume (spend) the cell.
- **How it works:** When a transaction tries to use a cell as an input, the CKB-VM runs the Lock Script. If the script returns `0` (success), the cell is unlocked.
- **Common Example:** The `Secp256k1` lock, which requires a valid digital signature from the owner's private key.

## 2. The Type Script (Validation)
The **Type Script** is like a set of rules for what can be inside the box and how those contents can change.
- **Purpose:** It determines *what* can happen to the cell's state and data during a transition.
- **How it works:** It ensures that the transition from input cells to output cells follows specific rules (e.g., "The total supply of tokens cannot increase").
- **Common Example:** An **sUDT** (Simple User Defined Token) Type Script ensures that tokens aren't created out of thin air.

## The Script Structure
A script consists of three main parts:
1.  **Code Hash:** A unique identifier (hash) of the RISC-V binary that contains the logic.
2.  **Hash Type:** Tells the VM how to find the code (usually via `type` or `data`).
3.  **Args:** Parameters passed to the script (e.g., the owner's public key hash).

---

## Why this separation matters
By separating **Who** (Lock) from **What** (Type), CKB allows for extreme flexibility. You can have a token (Type) that is owned by a single person, a multi-sig wallet, or even a DAO (Lock), without changing the token's logic itself.

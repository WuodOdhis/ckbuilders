# CKB Syscalls: How Scripts Interact with Transactions

Because CKB-VM is a secure, isolated sandbox, scripts cannot "see" the blockchain by default. They must use **Syscalls** to request information from the CKB node.

## 1. The Sandbox Model

A CKB script is a pure RISC-V program. It has its own memory and CPU registers, but no direct access to:
- The host machine's files.
- The network.
- The global blockchain state.

Instead, the CKB-VM provides a set of standard system calls (like a mini-OS) that the script can call to inspect the transaction it is part of.

## 2. Common Syscalls

The `ckb-std` library in Rust provides high-level wrappers for these low-level syscalls:

- **`load_transaction()`**: Get the entire transaction structure.
- **`load_cell_capacity(index, source)`**: Check how much CKB is in a specific input or output cell.
- **`load_cell_data(index, source)`**: Read the binary data (like a token amount or NFT image) from a cell.
- **`load_witness(index, source)`**: Read the signature or cryptographic proof provided by the user.
- **`debug()`**: Print a message to the CKB node's log (extremely useful for development).

## 3. The "Source" Parameter

When a script asks for a cell, it must specify where to look. This is the `source`:
- **`Source::Input`**: Cells being consumed (the "spending" side).
- **`Source::Output`**: New cells being created (the "receiving" side).
- **`Source::CellDep`**: Dependency cells (like libraries or other scripts).
- **`Source::GroupInput`**: Only the input cells that are protected by *this specific* script. This is the most common source used for Lock Scripts.

## 4. Why this matters for AI Agents

For autonomous agents, this syscall model is powerful. An agent's script can:
1. Use syscalls to check if a transaction meets specific "Market Rules."
2. Verify that the agent is being "paid" correctly in the outputs.
3. Ensure that the agent's internal state (stored in a cell) is being updated according to its own logic.

---

*Documented during Week 3, Day 5 of the CKBuilders program.*

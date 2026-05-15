# CKB Script Deployment: Data vs. Type Hash

In CKB, deploying a script means storing a RISC-V binary in the `data` field of a cell. This cell then becomes a "provider" of logic for other transactions.

## 1. The Deployment Process

1. **Compilation:** Transform source code (Rust/C) into a RISC-V binary.
2. **Transaction Construction:** Create a transaction where one of the outputs contains the binary in its `outputs_data`.
3. **Capacity Deposit:** Ensure the cell has enough CKB to cover the size of the binary (1 CKB per byte).
4. **On-Chain Persistence:** Once the transaction is mined, the script "exists" on the blockchain.

## 2. Referencing a Script

To use a deployed script, you define a `Script` structure:

```json
{
  "code_hash": "0x...",
  "hash_type": "data" | "type",
  "args": "0x..."
}
```

### Data Hash Deployment (`hash_type: "data"`)
The `code_hash` is the Blake2b hash of the binary data itself.
- **Pros:** Maximum security. The code is guaranteed to never change.
- **Cons:** If you find a bug and want to fix it, you have to deploy a new script and everyone must move their funds to a new address.

### Type Hash Deployment (`hash_type: "type"`)
The `code_hash` is the hash of a **Type Script** attached to the cell containing the binary.
- **Pros:** Enables **Upgradability**. You can update the binary in the cell without changing the Type Script hash. This allows for bug fixes while keeping the same user addresses.
- **Cons:** Users must trust the "Owner" of the Type Script not to replace the code with a malicious version.

## 3. CellDeps: The Link to Logic

When you send a transaction that uses a custom script, you must include the script's cell in the **`cell_deps`** field. 

**How it works:**
1. The CKB node sees a `code_hash` in your transaction.
2. It looks at all the cells listed in your `cell_deps`.
3. It hashes their data (or type scripts) and compares them to your `code_hash`.
4. Once a match is found, it loads that binary into the CKB-VM and executes it.

---

*Documented during Week 3, Day 4 of the CKBuilders program.*

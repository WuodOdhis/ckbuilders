# Week 5 Day 2: Mini UDT Type Script

Today I extended the type script idea from a toy counter into a minimal user-defined token: `mini-udt`.

The goal was to understand how token rules can live inside a type script. Instead of tracking balances in a database or a contract storage map, each token cell stores its balance directly in cell data. The type script reads all input cells and output cells in the same script group, sums the balances, and decides whether the transaction is valid.

The balance format is a 16-byte little-endian `u128`, similar to how xUDT-style tokens represent amounts. The script iterates through `Source::GroupInput` and `Source::GroupOutput` with `QueryIter`, loads each cell's data, reads the first 16 bytes, and adds the values into input and output totals.

The core rule is:

```txt
normal transfer: input_sum == output_sum
```

If the total input amount equals the total output amount, no tokens were created or destroyed, so the transfer is valid.

Then I added two extra branches:

```txt
mint: input_sum < output_sum
burn: input_sum > output_sum
```

Burning is allowed because destroying your own tokens does not harm the supply rules. Minting is restricted. The type script args are expected to contain a 32-byte owner lock hash. If a transaction creates more tokens than it consumes, the script scans all transaction inputs with `load_cell_lock_hash`. Minting only passes if one of the input cells is locked by the owner whose lock hash matches the script args.

That gives the mini token three behaviors:

- transfer: preserve total supply
- mint: allow supply increase only when the owner lock is present
- burn: allow supply decrease

I also hit two testing/build lessons. First, `cargo check` only proves the Rust code compiles for the host. To test a CKB script with `ckb-testtool`, the RISC-V binary must exist in `build/release`. That means running `make build` first.

Second, the test template originally treated `mini-udt` like a lock script and used empty cell data. That failed correctly because this script is a type script expecting at least 16 bytes of token balance data. The test needs normal always-success locks for authorization, and the mini-UDT script must be attached as the cell type.

This was the moment the difference between lock and type scripts really became practical. The lock just lets the transaction spend. The type script defines what the token is allowed to do.

## Screenshots
- [Mini UDT Script Logic](./screenshots/mini-udt-script.png)
- [Mini UDT Test Passing](./screenshots/mini-udt-test-pass.png)

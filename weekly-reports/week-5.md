# Week 5: Type Scripts & A Mini UDT

**Dates:** May 22 – May 29, 2026

This week was about moving from custom authorization into custom state rules. After building Agent Lock last week, I wanted to understand the other half of CKB script design: type scripts.

## From Locks To Types

Started by clarifying the difference between lock scripts and type scripts.

A lock script answers who is allowed to spend a cell. A type script answers whether the state transition is valid. That distinction made the CKB cell model click in a new way. Cells are immutable, so changing state means consuming old cells and creating new cells. The type script verifies that the transformation follows the rules.

The mental model for the week:

```txt
Lock script: Who is allowed to spend this cell?
Type script: Is this state transition valid?
```

## Counter Type Script

Built a minimal `counter-type` script to make the idea concrete. The counter stores an 8-byte little-endian `u64` in cell data. The script loads the first group input and first group output, rejects extra counter cells, decodes both values, and checks that the output equals the input plus one.

```txt
input:  3
output: 4
```

That passes.

```txt
input:  3
output: 99
```

That fails.

This was a small project, but it taught the core mechanics of type scripts: `Source::GroupInput`, `Source::GroupOutput`, `load_cell_data`, script groups, and validating state transitions from old cells to new cells.

## Mini UDT

Then I built a more practical type script: `mini-udt`.

The script treats each cell's first 16 bytes of data as a little-endian `u128` token balance. It sums every input cell in the current script group and every output cell in the same script group.

The rules:

- if `input_sum == output_sum`, it is a normal transfer
- if `input_sum > output_sum`, it is a burn and is allowed
- if `input_sum < output_sum`, it is a mint and requires the owner lock hash to be present in the transaction inputs

The owner authority is stored in the type script args as a 32-byte lock hash. During minting, the script scans transaction inputs with `load_cell_lock_hash` and checks whether the owner is present. This makes mint authorization part of the token rules instead of something only enforced off-chain.

## Testing Lessons

The test setup taught me almost as much as the script itself.

`cargo check` confirms the Rust code compiles, but it does not produce the RISC-V binary that `ckb-testtool` needs. For script tests, the flow is:

```bash
make build
cargo test
```

I also ran into the usual CKB script dependency sharp edges: Rust toolchain version, `schemars` compatibility, and the need for clang when building `ckb-std`. After pinning `schemars` and using the working build setup, the mini-UDT binary built successfully.

The copied template test originally treated the UDT contract like a lock script with empty data. That failed for the right reason. A UDT is a type script, so the cells need normal locks for authorization and the UDT script attached as the type. They also need 16-byte token balance data.

## Takeaway

Last week I proved I could write custom authorization. This week I started writing custom asset rules.

The important lesson is that CKB apps are not built around mutable contract storage. They are built around cells, scripts, and valid transformations. Type scripts are how a project defines what its state means and what changes are allowed.

## Screenshots
- [Counter Type Toolchain Setup](../logs/week-5/screenshots/counter-type-toolchain.png)
- [Mini UDT Script Logic](../logs/week-5/screenshots/mini-udt-script.png)
- [Mini UDT Test Passing](../logs/week-5/screenshots/mini-udt-test-pass.png)

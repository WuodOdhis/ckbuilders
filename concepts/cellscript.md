# CellScript: Writing Smart Contracts for the Cell Model

CellScript is a domain-specific language for writing CKB type scripts. It compiles to RISC-V ELF binaries that run inside the CKB-VM. Unlike Rust or C, CellScript is purpose-built for the cell model's consume-and-recreate paradigm.

## Resources, Not Storage

Instead of key-value storage (like Solidity's `mapping`), CellScript uses **resources**:

```
resource Token has store, create, consume, replace, burn, relock {
    amount: u64,
    symbol: [u8; 8],
}
```

A resource has a **type_hash**, which is a globally unique hash of its schema. The runtime uses type hashes to match cells across a transaction.

## Actions, Not Functions

Instead of calling contract methods, CellScript defines **actions**, which are state transitions that declare what cells they consume and create:

```
action swap_a_for_b(pool_before: Pool, input: Token, min_output: u64, to: Address)
    -> (pool_after: Pool, token_out: Token)
where
    assert(input.symbol == pool_before.token_a_symbol, "wrong input token")
    let fee = input.amount * pool_before.fee_rate_bps as u64 / 10000
    let amount_out = constant_product(pool_before, input.amount - fee)
    assert(amount_out >= min_output, "slippage exceeded")
    consume input
    create token_out = Token { amount: amount_out, symbol: pool_before.token_b_symbol } with_lock(to)
```

## Shared Cells (The Pool Pattern)

A **shared** resource is a cell that can be read and mutated by anyone, but only under the rules of its type script:

```
shared Pool has store, create, replace {
    reserve_a: u64,
    reserve_b: u64,
    total_lp: u64,
    fee_rate_bps: u16,
}
```

In practice, a "shared cell" is just a cell with a type script. Anyone can spend and recreate it, but the type script enforces the invariant (e.g., constant product formula).

## Action Dispatch

For reusable builders, compile each action as an explicit scoped artifact with
`--entry-action`. Do not rely on source order or fixture dispatch behavior as the
protocol boundary.

The transaction should bind to the intended artifact, CellDep, and script
identity. The builder should use compiler outputs as the contract with the
script, not hand-copied harness assumptions.

## Action Witness Encoding

Generate action witness bytes with `cellc entry-witness`. The format starts with:

```
CSARGv1\0 (8 bytes) + action-specific-params
```

Do not wrap these bytes in `WitnessArgs.input_type` by default. The generated
CellScript entry wrapper reads the raw entry-witness payload from the current
script group's witness surface. Script-group index `0` is group-relative, not
necessarily transaction-global `witnesses[0]`.

Use `WitnessArgs.input_type` or `WitnessArgs.output_type` only when the
CellScript source explicitly reads those witness surfaces.

## ProofPlan Metadata

Every compiled ELF includes a `proof_plan` array in its `.meta.json`. Each entry has:

- `trigger`: when does this rule apply?
- `scope`: what cells does it check?
- `reads`: what data does it access?
- `builder_assumptions`: what must the builder guarantee?

The builder should validate all `builder_assumptions` before constructing the
transaction. Use `cellc explain-assumptions`, `cellc solve-tx`, and
`cellc validate-tx` as the source of truth for the expected evidence shape.

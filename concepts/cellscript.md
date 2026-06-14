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

A resource has a **type_hash** — a globally unique hash of its schema. The runtime uses type hashes to match cells across a transaction.

## Actions, Not Functions

Instead of calling contract methods, CellScript defines **actions** — state transitions that declare what cells they consume and create:

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

CellScript follows a fixed dispatch rule:

- **Creation:** If no input cell has this type script, run the **first action** in the ELF.
- **Mutation:** If an input cell has this type script, read the witness to determine the action.

This means the order of actions in the source file matters. `seed_pool` must be first (for creation), then `swap_a_for_b`, `add_liquidity`, etc.

## Action Witness Encoding

The action witness goes in `WitnessArgs.input_type`, not `lock`. The format:

```
CSARGv1\0 (8 bytes) + action-specific-params
```

For `swap_a_for_b`: `CSARGv1\0 + min_output(u64 LE) + recipient(32 bytes)` = 48 bytes.

## ProofPlan Metadata

Every compiled ELF includes a `proof_plan` array in its `.meta.json`. Each entry has:

- `trigger` — when does this rule apply?
- `scope` — what cells does it check?
- `reads` — what data does it access?
- `builder_assumptions` — what must the builder guarantee?

The builder should validate all `builder_assumptions` before constructing the transaction, making it a **ProofPlan-validating builder**.

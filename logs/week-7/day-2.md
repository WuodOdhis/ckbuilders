# Day 2: The Missing Contract

**Date:** June 13, 2026

## Objective
Deploy `amm_pool.cell` to devnet and wire the builder to a real pool.

## Discovery
ArthurZhang's `amm_pool.cell` doesn't exist in the cloned `cell-labs/cell-script` repo. The repo is the compiler — examples in `tests/examples/` have no AMM pool. Arthur's forum posts reference it but it was never committed.

## What I Learned
- CellScript compiles to RISC-V ELF, defines both lock and type scripts
- An AMM type script encodes actions (swap, add/remove liquidity) in the witness via CoBuild OTX convention
- The type script verifies `newReserveA * newReserveB >= oldReserveA * oldReserveB` on every spend
- A compiled contract outputs a ProofPlan JSON via `cellc explain-proof` listing `reads`, `trigger`, `scope`, `builder_assumptions`

## Next
Write `amm_pool.cell` myself, compile it, deploy to devnet, and make the builder work against a real pool cell.

# Day 2: First launch_token Devnet Transaction

**Date:** June 20, 2026

## Objective

Move from understanding the new `v0.16.1` bootstrap path to actually running it on local devnet.

## What Worked

Compiled scoped CellScript artifacts with explicit entry actions:

```bash
cellc examples/launch.cell --entry-action launch_token --target riscv64-elf --target-profile ckb -o build/launch_token.elf
cellc examples/launch.cell --entry-action bootstrap_token --target riscv64-elf --target-profile ckb -o build/bootstrap_token.elf
cellc examples/token.cell --entry-action mint_with_authority --target riscv64-elf --target-profile ckb -o build/token_mint_with_authority.elf
cellc examples/amm_pool.cell --entry-action swap_a_for_b --target riscv64-elf --target-profile ckb -o build/amm_swap_a_for_b.elf
```

Then deployed the scoped `launch_token.elf` to local devnet and built a small script around it:

`scripts/launch_token_flow.js`

The script creates a launch input cell, generates canonical witness bytes with `cellc entry-witness`, builds the output topology expected by `launch.cell::launch_token`, dry-runs the transaction, and submits it.

## Result

The first `launch_token` transaction was accepted and committed on local devnet:

```text
0xaeeb1274c865df3d81216729b6491229cf955184f9800c723e6475012d62676d
```

This is the first real CellScript-validated transaction in this AMM builder path.

## Important Boundary

This does not mean the AMM is production-ready. The transaction follows the CellScript acceptance-fixture style. It proves the scoped launch action validates the expected topology, but it still uses fixture-style resource type scripts.

The next question is not just how to pass CKB validation. It is how to make the builder pass CellScript's pre-sign validation too.

## Remaining Issue

`cellc validate-tx` still fails because the transaction JSON lacks `builder_assumption_evidence` for capacity policy.

So there are two levels now:

- CKB accepted the transaction
- CellScript builder validation is not complete yet

## Next

Ask Arthur about the exact `builder_assumption_evidence` shape and whether external builder fixtures should keep using simple resource type scripts or move to scoped CellScript artifacts for each resource.

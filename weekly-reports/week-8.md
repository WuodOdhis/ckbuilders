# Week 8: CellScript v0.16.1 and the First Bootstrap Transaction

**Dates:** June 20, 2026

This week picked up directly from the Week 7 blocker. Last week I could deploy and sign transactions, but I could not honestly create real token cells because `token.cell` needed an existing `MintAuthority` and did not show where the first one came from.

ArthurZhang confirmed that the blocker was real and released CellScript `v0.16.1` with an explicit bootstrap path.

## Updating the Builder Path

I updated the local CellScript checkout to `v0.16.1` and reinstalled `cellc`. The new path is centered around `launch.cell`.

The important actions are:

- `bootstrap_token`, which creates the first `MintAuthority` and token outputs
- `launch_token`, which creates the first `MintAuthority`, token distribution, pool topology, LP receipt, and change token

This changed the project from guessing about token bootstrap to following a documented path.

The builder repo is here:

`https://github.com/WuodOdhis/cellscript-swap-builder`

## First Accepted Bootstrap Transaction

I compiled scoped artifacts with explicit entry actions and deployed `launch_token.elf` on local devnet. Then I wrote a small fixture script that creates the launch input, asks `cellc entry-witness` for canonical witness bytes, builds the expected outputs, dry-runs the transaction, and submits it.

The transaction committed successfully:

```text
0xaeeb1274c865df3d81216729b6491229cf955184f9800c723e6475012d62676d
```

This is the first real CellScript-validated transaction in the AMM builder path.

## What It Means

The original blocker is gone. There is now a working bootstrap path to build from.

But this is still not a production AMM. It is a fixture-style transaction that proves the scoped launch action can validate and commit the expected topology on devnet.

The next boundary is builder validation. CKB accepted the transaction, but `cellc validate-tx` still fails because the transaction JSON is missing `builder_assumption_evidence` for capacity policy.

## Takeaway

The project moved from being blocked on protocol bootstrapping to being blocked on builder completeness.

That is progress. The next step is to understand exactly what evidence CellScript expects before signing, then make the builder satisfy that instead of only making CKB accept the transaction.

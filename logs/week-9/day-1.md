# Day 1: CellScript v0.16.2 Builder Contract

**Date:** June 24, 2026

## Objective

Continue from the Week 8 boundary. The previous `launch_token` transaction proved
that CKB would accept the CellScript topology, but it still behaved like an
acceptance fixture. Today's goal was to move from fixture-style construction to
the compiler-supported builder path in CellScript `v0.16.2`.

## What Changed

Updated the local toolchain to CellScript `v0.16.2` and treated `cellc` as the
builder contract instead of manually guessing transaction rules.

```bash
cellc --version
# cellc 0.16.2
```

The important builder-facing commands are now:

```bash
cellc resource-identity --target-profile ckb --plan-output <resource-identities.json>
cellc builder manifest --target-profile ckb --entry-action <action> --resource-identities <plan.json>
cellc builder check --manifest <manifest.json> --resource-identities <plan.json> --tx <tx.json> --production
```

## Debugging Work

The `launch_token` path kept failing with CellScript error code `3`, which maps
to `CellLoadFailed`. At first this looked like a consumed-cell or resource
identity problem.

The actual issue was in the external builder script. It computed CKB script
hashes as:

```text
code_hash || hash_type || args
```

That is not the CKB script hash format. CKB hashes the Molecule-packed `Script`.
Because of this, the builder produced incorrect values for:

- the creator lock hash used by `with_lock(...)`
- the pool type hash copied into `LPReceipt.pool_id`

After switching to Molecule-packed `Script` hashing, the CellScript validation
failure disappeared.

## Result

The latest compiled `launch_token` artifact still matched the deployed local
devnet artifact:

```text
launch_token data hash: 0x58313619d62d83d460417f2d5bd2550ad0c114a27017efb434a11b445ac62ba0
```

So the problem was not stale deployed code. The problem started in the builder's
off-chain CKB hashing logic.

## Next

Turn the fixed diagnostic script into a cleaner builder command that:

- loads resource identities from the compiler-generated plan;
- reads the paired funding token from devnet;
- generates witness bytes with `cellc entry-witness`;
- dry-runs by default and only submits explicitly.

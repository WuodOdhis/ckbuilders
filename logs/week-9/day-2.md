# Day 2: Clean Devnet launch_token Builder

**Date:** June 24, 2026

## Objective

Package the working `launch_token` path into something usable for a hackathon
demo. The target was not to finish the whole AMM flow, but to make the first
builder milestone clean, repeatable, and safe to run on local devnet.

## Builder Update

Added a cleaned launch transaction builder to the public builder repo:

```text
https://github.com/WuodOdhis/cellscript-swap-builder
```

New script:

```text
scripts/build_launch_tx.py
```

The script now does the following:

- loads `auth`, `dist0`, `dist1`, `dist2`, `dist3`, `pool`, `lp_receipt`, and `change` type scripts from the CellScript resource identity plan;
- reads the paired funding token data from a live devnet cell instead of hardcoding the paired token amount and symbol;
- computes CKB script hashes using Molecule-packed `Script` encoding;
- calls `cellc entry-witness` for canonical `CSARGv1` witness bytes;
- writes a candidate transaction JSON;
- calls CKB `dry_run_transaction` by default;
- only broadcasts when `--submit` is passed.

## Verified Command

```bash
python3 scripts/build_launch_tx.py \
  --package-dir /tmp/opencode/cellscript-v0162/pkg \
  --identity-plan /tmp/opencode/cellscript-v0162/pkg/build/latest.resource-identities.json
```

Verified output:

```text
Funding token: 10000 PAIR0001
Creator lock hash: 0x0abf028eb7f3927ac1ee9761fb650b60f16ea4c25e6a076db1cd94eff954b413
Pool type hash: 0xa952d9ec6d6bcb404c792eccccf398ee50a848f69ff7a3514118406690e6fb17
Output capacity: 820.0 CKB
Dry run OK: 49848 cycles
```

## Repo Update

Committed and pushed the cleaned builder work:

```text
aeb0918 add devnet launch transaction builder
```

The update includes:

- `scripts/build_launch_tx.py`
- README instructions for dry-running the launch builder
- builder notes explaining the verified devnet dry-run and safe submit boundary
- ignored generated files: `launch_tx_final.json` and `launch_witness.bin`

## Current Status

The project is now demo-ready for the launch step:

- CellScript `v0.16.2` compiler path works.
- The launch transaction validates through CKB dry-run on local devnet.
- The funding cell has not been consumed by the cleaned builder yet.
- The script is safe to demo without accidentally submitting unless `--submit` is added.

## Remaining Work

The full AMM builder is not finished yet. The next actions for the hackathon are:

- broadcast `launch_token` when ready;
- index the created output cells;
- build live-cell versions of `mint_with_authority`, `seed_pool`, and `swap_a_for_b`;
- wrap the flow into one CLI.

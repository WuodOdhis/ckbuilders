# Week 7: CellScript AMM Builder

**Dates:** June 12 to June 15, 2026

This week was about moving from CellScript research into a real local-devnet transaction path. The goal was to take ArthurZhang's `amm_pool.cell` example, deploy it, and build toward a working AMM flow.

The week did not end with a swap. It ended with something more important: a clear understanding of what works, what was only a shortcut, and where the real blocker sits.

## From Idea To Devnet

I found the real `amm_pool.cell` example inside `cellscript/examples/`. It includes `seed_pool`, `swap_a_for_b`, `add_liquidity`, and `remove_liquidity`, so the task changed from writing my own AMM to learning how to build transactions for the existing CellScript contract.

I compiled and deployed `amm_pool.elf`, `token.elf`, and `always_success.elf` on a local `offckb` devnet. I also built CCC scripts for deployment, funding, signing, and local test-cell creation.

The public project repo for this work is:

`https://github.com/WuodOdhis/cellscript-swap-builder`

## Signing And Devnet Lessons

Most of the early work was not AMM logic. It was basic CKB transaction plumbing.

CCC signing only worked reliably after calling `prepareTransaction()` before signing. Without that step, the secp256k1 witness placeholder was missing, so the lock script verified a different sighash.

I also learned not to trust old devnet notes. Restarting `offckb node` creates a fresh genesis, which means old outpoints are dead. Several confusing `Unknown OutPoint` errors were just stale cells from an earlier chain.

## The Wrong Shortcut

To keep testing, I created token-like cells using `always_success.elf` as a stand-in type script. That helped confirm local cell creation and type-hash differences, but it was not a real token path.

Those cells do not enforce `token.elf` rules. They were useful test fixtures, not a valid foundation for claiming the AMM works.

## The Real Blocker

The blocker is `token.cell`.

The first action is `mint`, and it requires an existing `MintAuthority` input:

```txt
mint(auth_before: MintAuthority, to: Address, amount: u64)
```

But I could not find where the first `MintAuthority` cell is supposed to come from. No action in `token.cell` creates it.

That means the honest flow is blocked here:

```txt
MintAuthority bootstrap -> mint token cells -> seed_pool -> swap_a_for_b
```

Until I understand the bootstrap step, I cannot honestly create real `token.elf` token cells, run `seed_pool`, or run `swap_a_for_b`.

## Cleaning The Repo

Before posting the repo publicly, I cleaned it up to remove assumptions.

I removed fake ProofPlan integration files, deleted an old `swap_output.json` with bad witness bytes, fixed my Molecule `WitnessArgs` offset encoding, and rewrote the README so it presents the project as a builder friction report instead of a finished swap builder.

The Rust builder now clearly says what it is: a partial builder that encodes swap math, token data, pool data, and transaction shape. It has not produced a CKB-accepted AMM transaction yet.

## Takeaway

This week taught me that getting close to a real CKB app means respecting the cell lifecycle completely. It is not enough to produce bytes that look right. The inputs, type scripts, witnesses, cell deps, and bootstrap cells all need to match the protocol's actual state transition.

The next step is to ask the CellScript team how `token.cell` expects the genesis `MintAuthority` cell to be created. After that, the path is clear: mint real tokens, seed the pool, then attempt the first real swap.

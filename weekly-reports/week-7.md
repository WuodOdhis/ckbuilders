# Week 7: Wiring the AMM to Devnet

**Dates:** June 12 – June 14, 2026

Week 6 ended with a research-phase epiphany: CellScript's ProofPlan makes contracts inspectable, and an AI builder could use that metadata to construct valid transactions automatically. The obvious next step was to prove it worked. I needed to take the `amm_pool.cell` contract ArthurZhang published, deploy it to my devnet, and wire a deterministic swap builder against a real pool.

## Starting Over

The first surprise was that `amm_pool.cell` wasn't lost at all. I'd claimed in the week 6 report that it didn't exist in the cloned repo, but I'd simply been looking in the wrong directory. It was sitting in `cellscript/examples/` the whole time — a full implementation with `seed_pool`, `swap_a_for_b`, `add_liquidity`, and `remove_liquidity`. That changed the plan from "write the contract myself" to "understand and deploy what's already there."

I compiled both `amm_pool.cell` and `token.cell` into ELF binaries using `cellc`, getting back the expected `.elf` files and their `.meta.json` manifests. The ProofPlan metadata confirmed the four actions and their `builder_assumptions`. Everything looked clean.

## Deploying to Devnet

The 36KB `amm_pool.elf` deployed cleanly with `offckb deploy` — the tool handles everything from funding to signing for a single contract. The 14KB `token.elf` needed a different approach since `offckb deploy` only deploys one contract at a time. I wrote a custom CCC deploy script that constructs a deployment transaction with two output cells (one for the ELF code, one for the mint authority), signs with the devnet's secp256k1 key, and sends it.

Both deployments succeeded. The real work should have been straightforward from there.

## The Signing Debug Loop

What followed was roughly six hours of chasing my tail on what should have been a solved problem. I'd signed transactions before. But three separate bugs lined up in sequence, each one masking the next.

The first sign was that `get_live_cell` returned "unknown" for every cell I'd just deployed. The genesis transaction hash in my notes was wrong — `0x355a0c3a…` instead of the actual `0x1bb87da3…`. Every outpoint I referenced pointed at a cell that didn't exist in the real chain.

Once I had the right genesis hash, I hit signing errors. The private key for account #2 had a typo in my local notes. `offckb accounts` gave me the correct hex — `0x59ddda57ba06…` — but every signature still failed with error -31.

The third bug was the subtle one. CCC's `signOnlyTransaction` computes the sighash over whatever witnesses are currently in the transaction. Without calling `prepareTransaction` first to inject a 65-byte zeroed witness placeholder, it hashes an empty witness array, producing a completely different sighash than what the lock script recomputes at verification time. The fix was one line: call `prepareTransaction` before `signOnlyTransaction`.

## The Wrong Contract

With signing working, I pointed the pool type script at `amm_pool_swap.elf` — the version that only contains the swap action. The transaction failed with `EntryWitnessAbiInvalid` (error 25). This error comes from CellScript's witness dispatch: on creation, there's no typed input cell, so it runs whichever action is listed first in the contract. For `amm_pool_swap.elf`, that's `swap_a_for_b`, which immediately fails because there's no `pool_before` input to read.

The fix was obvious in retrospect: use `amm_pool.elf` (which lists `seed_pool` first) as the pool type script, not the swap-only variant.

## What's Left

Contracts are deployed. Signing works. I know which ELF to use. But I haven't created the actual Token cells yet — those need `token.elf` as their type script with 16-byte molecule data (amount + symbol), and they need different type script args so `seed_pool`'s `type_hash() != type_hash()` check passes. Once those exist, `seed_pool` can create the AMM pool cell, and the full swap pipeline can run end-to-end.

The swap builder itself is written (Rust, in `swap-builder/`), but it still works with mock data. Wiring it to live cells is the next session's job.

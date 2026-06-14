# Day 3: Deployment, Signing, and Root Cause Analysis

**Date:** June 14, 2026

## Objective
Wire the swap builder to a real devnet pool. Deploy contracts, fetch cells, send a signed swap transaction.

## What Actually Happened

### Found the Real amm_pool.cell
The contract was in `cellscript/examples/` all along — a full implementation with `seed_pool`, `swap_a_for_b`, `add_liquidity`, and `remove_liquidity` actions. Compiled it and the standalone swap version.

### Deployed Two ELFs
- `amm_pool.elf` (36KB) via `offckb deploy`
- `token.elf` (14KB) via custom CCC signing script
- Created a 100 CKB always_success cell for zero-signing test transactions

### The Signing Debug Loop (~6 hours)
Three bugs in sequence:

1. **Wrong genesis tx hash.** Used `0x355a0c3a…` from a past session. The actual genesis hash from `get_block_by_number(0)` is `0x1bb87da3…`. Every `get_live_cell` returned "unknown" because the outpoint didn't exist.

2. **Wrong private key.** Account #2's key in the old summary had a different hex. `offckb accounts` showed the correct key: `0x59ddda57ba06…`.

3. **Missing prepareTransaction.** `signOnlyTransaction` computes the sighash over the current witness array. Without a `WitnessArgs` placeholder (65 zero bytes), it hashes an empty witness, producing a different hash than what the lock script computes.

### CCC getKnownScript Monkey-Patch
The return format must be:
```javascript
cellDeps: [{ cellDep: { outPoint: { txHash, index: 0 }, depType: 'depGroup' } }]
```
Key details: `cellDep` (singular wrapper), `index` is a number, `depType` is camelCase.

### EntryWitnessAbiInvalid (Error 25)
The swap ELF puts `swap_a_for_b` first. On creation (no typed input), CellScript runs the first action. `swap_a_for_b` needs a `pool_before` input → fails.

**Fix:** Use `amm_pool.elf` (seed_pool first) as the pool type script.

### ckb2023 Capacity Cost
14KB token.elf needs ~14,153 CKB occupied capacity. The error said `expected occupied capacity (0x14880317d00) <= capacity (0x4a817c800)` — my 200 CKB was 13,953 CKB short.

## State After Day 3

| Item | Status |
|------|--------|
| amm_pool.elf deployed | ✅ |
| token.elf deployed | ✅ |
| always_success cell | ✅ (100 CKB) |
| CCC signing | ✅ |
| Token cells | ❌ |
| Pool cell | ❌ |
| Swap tx | ❌ |

## Next
Create Token cells with token.elf type script, then seed_pool, then swap.

# Day 4: Removing Assumptions Before Asking for Help

**Date:** June 15, 2026

## Objective

Stop trying to force the AMM path with fake token cells. Clean the swap-builder repo so it accurately reflects what works, what is only a workaround, and what is actually blocked.

## What Changed

### Cleaned the Public Builder Repo

The `cellscript-swap-builder` repo is now honest about its state. It no longer presents itself as a finished ProofPlan-aware AMM builder.

Removed:

- `builder_assumptions.json`
- `evidence.json`
- `swap_output.json`

Those files made the project look further along than it was. The ProofPlan files were static dumps, not real validation. The swap output contained old witness bytes from a broken encoding attempt.

### Fixed the WitnessArgs Encoding Bug

The Rust builder had a bad Molecule `WitnessArgs` layout. The original offset logic made the `input_type` witness effectively unreadable by the script.

The corrected shape is:

```text
total_size
lock_offset = 16
input_type_offset = 16
output_type_offset = total_size
input_type = Bytes(length + CSARGv1 payload)
```

That matches the convention where an offset equal to `total_size` means the optional field is absent.

This does not prove the CellScript EntryWitness is correct on-chain. It only fixes the CKB Molecule wrapper bug.

### Removed Fake Claims

I renamed the local JSON hash helper so it no longer pretends to compute a real CKB transaction hash. CKB hashes molecule-serialized transaction bytes, not JSON strings.

I also removed unused Rust dependencies that implied features the builder does not have yet.

### Documented the always_success Workaround

`create_tokens.js` now clearly says that it uses `always_success.elf` as a stand-in type script. These are not real token cells. They do not enforce token validation.

The workaround helped test local cell creation, but it cannot be the foundation for claiming the AMM works.

## Main Constraint

The unresolved constraint is still `token.cell`.

`mint` requires an existing `MintAuthority` input:

```text
mint(auth_before: MintAuthority, to: Address, amount: u64)
  -> (auth_after: MintAuthority, token: Token)
```

But I do not know how the first `MintAuthority` cell is intended to be created.

Possible paths I considered:

- a separate launch/setup contract
- `launch.cell`
- a deploy-time bootstrap transaction
- a special meaning of the `create` capability on `MintAuthority`

I do not want to assume any of those.

## Forum Post Prepared

I prepared a Nervos Talk post aimed at Arthur and the CellScript team. The post focuses on the real friction points from the repo:

1. How is the genesis `MintAuthority` cell created for `token.cell`?
2. Is first-action-on-creation a guaranteed CellScript rule?
3. What is the canonical path for EntryWitness encoding?
4. Which ProofPlan assumptions should a builder enforce before signing?
5. Is there a recommended local fixture pattern besides fake always_success token cells?

## State After Day 4

| Item | Status |
|------|--------|
| amm_pool.elf deployed | Done |
| token.elf deployed | Done |
| always_success.elf deployed | Done |
| CCC signing path | Done |
| Rust encoding builder | Partial |
| ProofPlan validation | Not implemented |
| Real token.elf token cells | Blocked |
| seed_pool | Blocked |
| swap_a_for_b | Blocked |

## Next

Ask the CellScript team about the `MintAuthority` bootstrap path. Do not build further on fake token cells unless they are clearly labeled as local fixtures.

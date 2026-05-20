# Day 1: Custom Lock Script Deployment

**Date:** May 13, 2026

## Environment Setup & Deployment
Compiled the custom `always-success` Rust lock script and deployed it to the OffCKB devnet using CCC.
```bash
./scripts/reproducible_build_docker
cd experiments/locks && npm run deploy
```

## Script Mechanics & Execution
- **Address Generation:** Created a custom CKB address mapped exactly to the deployed script's `code_hash`.
- **Funding:** Deposited 200 CKB into a cell locked by the custom address.
- **Spending:** Executed a spend transaction referencing the deployed binary in `cellDeps` without requiring an ECDSA signature.

## Progress & Troubleshooting
- **BigInt Precision:** Resolved a `TypeError` by explicitly casting `occupiedSize` to `BigInt` before calculating cell capacity.
- **VM Versioning (`data1`):** Encountered `MemWriteOnExecutablePage` error due to using `hash_type: "data"` (CKB-VM v0). Fixed by switching to `hash_type: "data1"` to enable the CKB-VM v1 features required by modern Rust binaries.
- Successfully verified that ownership on CKB is defined purely by executable code, bypassing default `secp256k1` signature checks.

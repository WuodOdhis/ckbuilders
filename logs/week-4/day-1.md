# Day 1: Custom Lock Script Deployment

**Date:** May 13, 2026

## Objectives
- Compile the custom `always-success` Rust lock script to a RISC-V binary.
- Deploy the binary onto the local OffCKB devnet.
- Generate a custom CKB address mathematically linked to the deployed script.
- Execute a spend transaction to prove the CKB-VM can execute the custom script to authorize the transfer without a standard private key signature.

## Process & Execution

### 1. Compilation
We utilized the `ckb-script-templates` Docker build pipeline to circumvent local toolchain dependency issues.
```bash
./scripts/reproducible_build_docker
```
**Result:** Successfully generated a 147KB RISC-V binary at `build/release/always-success`.

### 2. Deployment (`deploy.ts`)
Created a Node.js/TypeScript environment using `@ckb-ccc/core` to handle the deployment.
- Read the binary into a hex string.
- Calculated the exact required capacity for the cell (147,357 CKB).
- **Learning - BigInt Precision:** Discovered that depending on the SDK version, cell `occupiedSize` can be returned as a `BigInt`. Attempting to add a standard JavaScript `number` (buffer length) to a `BigInt` throws a `TypeError`. We fixed this by explicitly casting both to `BigInt` before calculating the final capacity.
- **Output:** The transaction was mined, yielding a `tx_hash` and a `code_hash` for our custom program.

### 3. Execution (`spend.ts`)
We constructed a script to fund our custom address and immediately spend from it.
- Generated the custom address using `ccc.Address.fromScript`.
- Funded the address with 200 CKB.
- Constructed a spend transaction referencing our deployed binary in `cellDeps`.
- **Learning - CKB-VM Versions:** We initially hit a `VM Internal Error: MemWriteOnExecutablePage` error. This occurred because we set the lock script's `hashType` to `"data"`, which forces the network to use the legacy **CKB-VM Version 0**. Because modern Rust scripts compile targeting CKB-VM Version 1 features, the legacy VM crashed. Changing the `hashType` to `"data1"` correctly invoked **CKB-VM Version 1**, and the transaction executed flawlessly.

## Milestone Reached
We successfully bypassed the default `secp256k1` signature checks of the blockchain, proving that ownership on CKB is defined purely by executable code, not hardcoded cryptographic keys.

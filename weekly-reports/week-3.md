# Week 3: CKB-VM & Script Architecture

**Dates:** May 5 – May 12, 2026

This week was about finishing up the frontend token logic and diving deep into how to actually write custom scripts for the CKB-VM in Rust.

## Asset Factory & CCC Completers
Finished the UI for the `day-4-asset-factory`. It now handles xUDT transfers. 
The CCC SDK was really helpful here, specifically the completer functions. On CKB, if you spend a cell, you consume the whole thing. If you only want to send a fraction of its value, you have to manually construct a "change cell" to send the remainder back to yourself. Calling `tx.completeInputsByUdt()` handles all of this capacity calculation and change cell generation automatically, which saves a ton of boilerplate.

## Spore Protocol (DOBs)
Integrated Spore (Digital Objects) minting into the dApp. Spores are interesting because the asset data (like an image or text) is stored directly in the cell, not on IPFS. And because of the 1 CKB = 1 Byte rule, the NFT literally holds CKB inside it to pay for its own storage. 
Ran into a compatibility issue with `ccc.randomBytes` during the implementation but managed to work around it.

## Script Scaffolding
Transitioned to the Intermediate track to start writing custom scripts. 
Set up a new Rust project using `ckb-script-templates` (moving away from the older `Capsule` framework). Scaffolded an `always-success` lock script. 

The anatomy of a script is surprisingly minimal. It's a `#![no_std]` Rust binary that exports a `program_entry` function. If the function returns `0`, the validation passes. It doesn't mutate state; it just verifies that the state transition proposed by the transaction follows the rules.

Ran into some network timeouts downloading `rust-std` for the `riscv64imac-unknown-none-elf` target during the `make build` process, but eventually got the RISC-V binary compiled. Next week I'll deploy it to the devnet.

## Screenshots
- [Token Minting](../logs/week-3/screenshots/token-minting-success.png)
- [Asset Factory UI](../logs/week-3/screenshots/asset-factory-ui.png)
- [DOB Mint Interface](../logs/week-3/screenshots/asset-factory-connected.png)
- [Rust Script Code](../logs/week-3/screenshots/always-success-code.png)
- [Cargo Build Logs](../logs/week-3/screenshots/cargo-ckb-crates.png)

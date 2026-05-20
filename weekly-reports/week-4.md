# Week 4: Custom Lock Scripts & A Production Product

**Dates:** May 13 – May 21, 2026

This week was about writing real custom lock scripts for CKB-VM, deploying them to the devnet, and then taking everything further by turning the experiment into a real, usable product.

## Always-Success Deployment

Started the week by compiling and deploying the `always-success` Rust script I scaffolded last week. It's the simplest possible lock - return 0 and let anyone spend the cell. But even something trivial taught me a lot: how address generation maps to a script's `code_hash`, how to fund a custom-locked cell, and how to reference deployed binaries in `cellDeps` during a spend transaction.

Hit a `MemWriteOnExecutablePage` error with CKB-VM v0 (`hash_type: "data"`) and fixed it by switching to `data1` for CKB-VM v1 support. The lesson: modern Rust binaries need the newer VM version.

## The Atomic Nightmare

Then I tried to build something real - an Agent-Owned Lock that authorizes spending via a secret code in the witness. The first compile and deploy worked fine. But every spend transaction failed with `InvalidInstruction` at a specific program counter.

Dumped the RISC-V disassembly and found `lr.d.aq` - a load-reserved instruction from the RISC-V Atomic extension. CKB-VM doesn't support atomics because it's single-threaded. The `bytes` crate under `ckb-std` was injecting them for reference counting.

Fixed it by flipping `+a` to `-a` in the Makefile's `RUSTFLAGS`. The compiler emulates atomics with regular loops instead. No more atomic instructions, no more crashes.

## Full ECDSA Signature Recovery

Upgraded the Agent Lock from a plaintext secret code (vulnerable to frontrunning) to production-grade `secp256k1` ECDSA signature recovery. Integrated `k256` and `blake2b-ref` as `no_std` dependencies. The on-chain flow: load the transaction hash, recover the signer's public key from the 65-byte witness signature, hash it to Blake160, and compare against the trusted key in the script args.

It worked. The VM verified a real ECDSA signature entirely inside a RISC-V contract running on CKB.

## Built a Product

Then I stopped treating this like a lab experiment and built something I can actually show someone.

The **CKB Agent Lock** is a full-stack Web2-to-Web3 bridge. An admin locks a reward pool on-chain, listing which Telegram usernames are eligible. Each user visits a claim portal, proves their Telegram identity via a bot, and the server builds and signs the spend transaction using the Agent's private key. The on-chain lock script recovers the public key from the signature and verifies the Agent authorized it.

I built two separate UIs - an Admin Dashboard with real-time claim tracking (who claimed, how much remains), and a User Portal for the claim flow. The Express server handles the API layer, Telegram bot integration, and CCC transaction construction.

The repo is live at `github.com/WuodOdhis/agentckblock` - tested on devnet, end-to-end, and ready for mainnet.

This is the first time in this program where I stopped following a tutorial and just built something I wanted to exist. The whole point of CKB's lock script model is that you're not limited to "ECDSA or nothing." You can write any auth logic you want. I proved that by making a lock that answers to a Telegram handle.

## Screenshots
- [Always-Success Deployment](../logs/week-4/screenshots/always-success-deploy.png)
- [RISC-V Disassembly](../logs/week-4/screenshots/riscv-disasm-atomic.png)
- [Agent Lock ECDSA Flow](../logs/week-4/screenshots/agent-lock-ecdsa.png)
- [Admin Dashboard](../logs/week-4/screenshots/admin-dashboard.png)
- [User Claim Portal](../logs/week-4/screenshots/user-claim-portal.png)
- [GitHub Repo](../logs/week-4/screenshots/github-repo.png)

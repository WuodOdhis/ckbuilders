#  CKBuilders: AI Agent Architecture on CKB

A deep-dive exploration into building autonomous, AI-agent-driven systems on the Nervos Common Knowledge Base (CKB). This repository tracks my journey through the CKBuilders program, focusing on the intersection of **PoW Security**, **UTXO Scalability**, and **Autonomous Logic**.

##  Core Objectives
1. **Master the Cell Model:** Transition from account-based paradigms to cell-oriented development.
2. **AI-Agent Integration:** Explore how CKB's off-chain computation and on-chain verification enable highly parallelized agent operations.
3. **PoW + UTXO Synergies:** Leverage the security of Proof of Work and the concurrency of UTXOs for scalable agent economies.

##  Repository Structure
- `logs/`: Daily technical logs and "Aha!" moments.
- `concepts/`: Deep dives into CKB architecture, scripts, and cell logic.
- `experiments/`: Proof-of-concept scripts and local devnet tests.
- `weekly-reports/`: High-level summaries of progress and key learnings.
- `capstone/`: The final project implementation.

##  Environment
- **Node:** v20.x
- **CLI:** OffCKB
- 

---

##  Project Showcase

### Week 1: Foundations & First Transactions

**CKB Academy — Theoretical Foundations**
![CKB Academy](logs/week-1/screenshots/ckb-academy.png)

**GitHub Repository Setup**
![GitHub Repo](logs/week-1/screenshots/github-repo-setup.png)

**First CKB Transfer (99 CKB via Simple Transfer dApp)**
![CKB Transfer](logs/week-1/screenshots/day-2-transfer-ui.png)

### Week 2: Practical Application & Tooling

**CKB Simple dApp — Connected via JoyID Passkey**
![JoyID dApp](logs/week-2/screenshots/joyid-dapp.png)

**xUDT Token Issuance Interface**
![xUDT DApp](logs/week-2/screenshots/xudt-dapp.png)

### Week 3: Script Development & Advanced Logic

**CKB Asset Factory — Premium Glassmorphism UI**
![Asset Factory](logs/week-3/screenshots/asset-factory-ui.png)

**Token Minting — Custom Script Experiment**
![Token Minting](logs/week-3/screenshots/token-minting-success.png)

**Always-Success Lock Script in Rust (RISC-V)**
![Always Success Code](logs/week-3/screenshots/always-success-code.png)

**Building RISC-V Binary & Downloading CKB Crates**
![Cargo Build](logs/week-3/screenshots/cargo-ckb-crates.png)

---

## Next Implementation Goals

Based on progress through the CKBuilders program, the following features are queued for implementation:

1. **Deploy Custom Lock Script:** Take the compiled `always-success` binary and deploy it to the local devnet to create a custom address.
2. **DOBs / Spores (NFTs):** Master the Spore Protocol to mint and manage Digital Objects and on-chain media using Cluster Cells.
3. **Fiber Network Simulation:** Simulate a payment channel open/close flow on the local devnet using the concepts studied in Week 2.

---

> "The Cell Model isn't just a way to store state; it's a way to architect autonomy." — Day 1 Reflection.

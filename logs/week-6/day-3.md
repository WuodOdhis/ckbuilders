# Week 6 - Day 3: CellFabric & The `ProofPlan` Epiphany

**Date:** June 10, 2026

## Objective
Investigating how "Intents" are formally structured. Looked into the inter-protocol layer known as **CellFabric** and recent updates to the smart contract tooling.

## Research: CellScript v0.15
Read through ArthurZhang's forum posts on CellFabric and the newly released `CellScript v0.15`.
*   Arthur is delaying the global CellFabric layer to focus on making single protocols highly inspectable first.
*   The v0.15 release introduces the **Covenant ProofPlan**. Using the new command `cellc explain-proof`, a compiled CKB smart contract can now output a JSON file explicitly detailing its `reads`, `trigger`, `scope`, `coverage`, and `builder assumptions`.

## The Breakthrough
This changes everything for AI on CKB. Instead of an AI needing to reverse-engineer a compiled RISC-V binary to interact with a new dApp, the AI can simply ingest this `ProofPlan` JSON. It can read exactly what the contract requires and autonomously generate valid CoBuild OTXs for any new protocol without human intervention.

## Next Steps
- Review the `agent-lock` code from last month.
- Explore how to parse a `ProofPlan` JSON in TypeScript/Rust.
- Brainstorm the architecture for an AI-driven OTX Solver.

# Implementation Journey: AI Agent OTX Solver

## The Goal
To build an AI Agent that autonomously generates CoBuild Open Transactions (OTXs) by ingesting the `ProofPlan` JSON metadata from CKB smart contracts.

## Why This is a Goldmine for AI Research
Because of the recent v0.15.0 compiler updates in the CKB ecosystem, a smart contract isn't just a black box of compiled RISC-V code anymore. It now outputs a **Covenant ProofPlan** in JSON format.

Our AI Agent doesn't need to be a blockchain core developer to understand a dApp. It can simply run the `cellc explain-proof` command on a contract, read the JSON output, and instantly know exactly what inputs the contract needs (`reads`), what conditions trigger it (`trigger`), and what it's trying to enforce (`scope`).

If we want to build an AI that autonomously generates Open Transactions (OTXs) for CKB, having the AI ingest this `ProofPlan` JSON to figure out *how* to construct the transaction is the most cutting-edge thing we can build right now.

## Phase 1: Environment & Tooling Setup
1. **Agent Wallet Foundation:** We will reuse our `agent-lock` Rust script. The AI needs a native way to hold assets on CKB with limited, revocable rights.
2. **Metadata Extraction:** We will set up a TypeScript service that uses `cellc explain-proof` (or parses pre-compiled metadata files) to extract the `ProofPlan` JSON from target protocols (like a dummy AMM or UDT contract).

## Phase 2: Building the JSON Parser
1. **Schema Mapping:** The AI needs to map the `ProofPlan` fields into actionable data structures:
   - `trigger`: When should the AI act? (e.g., `type_group` execution).
   - `reads`: What input cells and witnesses does the AI need to fetch from the CKB RPC?
   - `scope`: What is the boundary of the transaction it needs to build?
2. **LLM Integration:** We will feed this JSON schema directly into the AI's context. The system prompt will instruct the AI: *"You are an Intent Solver. Read this protocol's ProofPlan. Based on the user's Intent (e.g., Swap X for Y), construct the exact CoBuild Action and Message required to satisfy this ProofPlan."*

## Phase 3: Constructing the OTX
1. **CoBuild Integration:** The AI will use the `CCC SDK` to construct a partial transaction. 
2. **Intent Encoding:** Instead of building the full transaction, the AI will format the `Message` and `Action` fields within the OTX witness, strictly following the rules dictated by the `ProofPlan` it just ingested.
3. **Broadcasting:** The AI will sign its partial transaction (using its `agent-lock`) and broadcast it to an off-chain P2P pool (or a dummy local server mimicking a solver pool).

## Phase 4: The Final Settlement (The Agent-to-Agent Loop)
To fully demonstrate this, we will run *two* agents:
- **Agent A (The Creator):** Reads the `ProofPlan` and creates the Intent (OTX).
- **Agent B (The Solver):** Listens to the pool, collects Agent A's OTX, provides the necessary fee/routing cells, constructs the final CKB Transaction, and submits it to our local devnet.

## Next Steps
- Write a basic Rust script that generates a `ProofPlan` (or manually mock a `ProofPlan` JSON based on the v0.15 spec).
- Write a Node.js script that feeds this JSON to the LLM and asks it to output a transaction structure.

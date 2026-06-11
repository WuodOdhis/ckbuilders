# Week 6 - Day 2: State Contention & Intent Solvers

**Date:** June 9, 2026

## Objective
Shifted focus from agent custody to transaction generation. How do agents actually interact with DeFi protocols on CKB without getting blocked by UTXO contention?

## Research: CoBuild Open Transactions (OTX)
The Cell model's biggest bottleneck for DeFi is "State Contention" (everyone trying to spend the same liquidity cell at the same time).
*   The ecosystem is solving this via **CoBuild OTX**, which allows users to sign partial transactions or "Intents".
*   Instead of perfectly balancing inputs/outputs, an OTX witness contains a `Message` and an `Action` (e.g., "I want to swap 100 USDT for USDC with 1% slippage").

## The Unsolved Problem
The network desperately needs "Collectors" or "Solvers" to aggregate these scattered OTXs off-chain, match them, and submit full CKB transactions. A generic mempool for this is too hard to build right now.

## Takeaway
An AI agent is the perfect specialized Solver. It can sit off-chain, listen to the p2p network for specific OTX intents (like DEX limit orders), calculate the most optimal matching paths, and submit the final blocks for a fee.

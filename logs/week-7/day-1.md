# Day 1: Deterministic Swap Builder

**Date:** June 12, 2026

## Objective
Phase 3 of the OTX builder. Write a deterministic TypeScript builder that constructs a real swap transaction for an AMM pool on CKB.

## Built: swap_builder.ts

A skeleton that takes `amountIn`, `minAmountOut`, `poolOutPoint` and:
1. Computes new reserves off-chain using `k = reserveA * reserveB`
2. Validates `amountOut >= minAmountOut`
3. Constructs a transaction consuming the pool cell + user token cell, producing updated cells

## Key Concept: State Replacement

On Ethereum a swap updates contract storage. On CKB you destroy the old pool cell and create a new one. The builder is deterministic because same inputs always produce identical tx bytes.

## What's Missing
Real pool fetching, real user token cell, witness action encoding, signing and sending. All placeholder data for now.

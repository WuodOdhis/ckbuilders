# Day 1: Transitioning to Practical Application

**Date:** April 27, 2026  
**Phase:** 2 (Practical Application & Tooling)  
**Objective:** Transitioning from theoretical fundamentals to practical dApp development by establishing a foundational React-based connection to the CKB network using CCC and the JoyID Wallet.

---

## The "Simple DApp" Foundation

To kick off Week 2, I started by building a practical bridging project: a simple CKB application (`day-4-asset-factory`). This project serves as my first direct interaction with the CKB blockchain via a frontend interface. 

Instead of writing raw transaction hexes manually as I did in Week 1, I am now leveraging the **CKB Component Chain (CCC)** framework in a modern web environment (React + Vite) to abstract the complexities of network connections and cryptographic signing.

### What Was Achieved:
1. **Wallet Integration:** Successfully integrated the CCC provider to prompt and connect to CKB wallets, specifically targeting the seamless user experience of the **JoyID passkey wallet**.
2. **Reading On-Chain State:** Implemented a signer capable of fetching the active Testnet Address and querying the live available CKB balance directly from the network.
3. **Environment Setup:** Configured a frontend environment robust enough to handle CKB's cryptographic requirements (e.g., configuring `vite-plugin-node-polyfills` to ensure compatibility).

---

## Why This Matters

Building this simple connection application is the exact starting point needed for issuing **User Defined Tokens (UDTs)** and **Spores (NFTs)**. Both of these advanced operations require:
- A user identity (Address/Lock Script).
- The ability to sign transactions (Signer).
- A way to check available capacity to fund the transactions (Balance).

With this application acting as the "Asset Factory" dashboard, the groundwork is laid for the rest of Week 2. I have essentially built the launchpad.

## Next Steps

With the wallet connection working smoothly:
1. Deep-dive into how the `ccc` library constructs Lock Scripts behind the scenes.
2. Extend the frontend to support signing a simple CKB transfer.
3. Prepare the infrastructure for deploying my first UDT on the Testnet.

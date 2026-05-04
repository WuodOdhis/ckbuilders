# Fiber Network: CKB's Layer 2 Payment Channel Architecture

The Fiber Network is CKB's Layer 2 payment infrastructure — a network of off-chain payment channels that enables instant, high-throughput, and near-zero-fee transactions between parties, settling to the CKB Layer 1 only when necessary.

It is conceptually similar to Bitcoin's Lightning Network, but significantly more powerful because it is built on top of CKB's programmable script model rather than Bitcoin's limited Script language.

---

## The Problem It Solves

CKB's Layer 1 is a Proof-of-Work blockchain. It is designed for security and finality, not for high-speed micro-payments. Every transaction requires block confirmation, which takes time and costs on-chain fees.

For use cases like:
- Real-time payment gateways
- Micro-transactions (paying per API call, per second of streaming, etc.)
- High-frequency trading between known parties
- Gaming economies with thousands of small transfers

...Layer 1 is far too slow and expensive. The Fiber Network moves these operations off-chain while maintaining the security guarantees of Layer 1 as the final settlement layer.

---

## How It Works

### 1. Opening a Channel

Two parties create a **Funding Cell** on Layer 1 — a multi-signature cell locked by a 2-of-2 Lock Script. Both parties deposit funds into this cell, committing their initial balances.

```
Alice deposits 500 CKB
Bob deposits 500 CKB
→ On-chain Funding Cell: 1000 CKB total, requires both signatures to spend
```

### 2. Off-Chain Payments

Once the channel is open, Alice and Bob can transact at unlimited speed without touching Layer 1. Each payment creates a new **Commitment Transaction** — a fully signed transaction that *could* be broadcast to Layer 1, but isn't. Both parties hold the latest signed state at all times.

```
Alice pays Bob 100 CKB off-chain
→ Both sign: "Latest state: Alice=400, Bob=600"
Alice pays Bob 50 more CKB
→ Both sign: "Latest state: Alice=350, Bob=650"
```

Neither party needs to trust the other because each always holds a valid, signable proof of the current balance split.

### 3. Multi-Hop Routing with HTLCs

For payments between parties who do not have a direct channel (e.g., Alice → Bob → Carol), the Fiber Network uses **HTLC (Hashed Time-Lock Contract)** cells.

**How HTLCs work:**
1. Carol generates a secret preimage `S` and shares its hash `H = hash(S)` with Alice.
2. Alice locks a payment: *"Bob can claim 100 CKB if he reveals the preimage for H, within 24 hours."*
3. Bob creates an equivalent lock toward Carol: *"Carol can claim 100 CKB if she reveals the preimage for H, within 12 hours."*
4. Carol reveals `S` to claim her 100 CKB from Bob. Bob now knows `S`.
5. Bob reveals `S` to claim his 100 CKB from Alice. The route is atomically settled.

If any step fails, the time-lock expires and all funds are returned. **No single party can steal funds.**

### 4. Closing a Channel

Either party can close the channel at any time by broadcasting the latest Commitment Transaction to Layer 1. The Funding Cell is consumed and two new cells are created — one for Alice's final balance, one for Bob's.

There is a **dispute window** (e.g., 48 hours) during which the other party can challenge with a more recent signed state if the closing party tried to cheat by broadcasting an old transaction.

---

## Why CKB Makes Fiber More Powerful Than Lightning

| Feature | Bitcoin Lightning | CKB Fiber |
|---|---|---|
| Script Language | Bitcoin Script (limited) | RISC-V (full programs) |
| Asset Support | BTC only | CKB + xUDT tokens + Spore NFTs |
| HTLC Logic | Hardcoded | Fully programmable Type Script |
| Protocol Upgrades | Hard fork required | Deploy a new script |
| Bitcoin Compatibility | Native | Via RGB++ bridge |

Because the HTLC logic in Fiber is a **CKB Type Script**, developers can write custom settlement rules in Rust — for example, routing a payment that is *partly* in CKB and *partly* in an xUDT stablecoin within the same channel.

---

## The Payment Gateway Pattern

From a practical developer perspective, the Fiber Network enables a classic **payment gateway** architecture:

```
Customer → [Fiber Channel] → Merchant Hub → [Fiber Channel] → Merchant
                                  ↑
                          Routes payments instantly,
                          settles to L1 once/day
```

This pattern reduces effective transaction costs for the merchant to near-zero for high-volume use cases, while the customer gets instant payment confirmation.

---

## Connection to the Broader CKB Ecosystem

- **RGB++ Assets:** Bitcoin assets bridged to CKB via the RGB++ protocol can be routed through Fiber channels, connecting Bitcoin's liquidity to CKB's payment network.
- **Spore Assets:** Because Fiber supports any CKB cell type, Spore NFTs could theoretically be transferred through payment channels.
- **DeFi Composability:** AMM or lending protocols on CKB Layer 1 can use Fiber for high-frequency rebalancing without paying per-transaction Layer 1 fees.

---

*This concept was studied and documented during Week 2 of the CKBuilders program.*

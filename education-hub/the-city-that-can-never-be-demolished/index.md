---
title: "The City That Can Never Be Demolished"
coverImage: 'images/cover.png'
category: Architecture
subtitle: 'Every blockchain is a city where nothing is torn down. CKB is the rare one that makes you pay for the land, and gives it back when you let go.'
date: '2026-11-20T00:00:00.000Z'
author:
- github:WuodOdhis
---

*Every blockchain is a city where nothing is torn down. CKB is the rare one that makes you pay for the land, and gives it back when you let go.*

---

Imagine a city where demolition is illegal.

You can build. You can renovate. You can abandon a building and walk away. But nothing can ever be removed. Not the tower, not the shed, not the notice board still advertising last year's weather.

For the first few years, nobody notices. There is space. Then the city fills with abandoned structures, half-finished projects, and rooms nobody visits. New residents are pushed to the edges. Yet every new arrival is still expected to maintain the entire city, including the ruins.

That is not a metaphor for the internet. It is a fairly literal description of a blockchain.

A blockchain is a shared memory that no one may edit. Every full node keeps a copy of the state the network has agreed on, and every new node that joins must accept the whole thing. That is what makes the system trustworthy: no one can quietly change the past. But it also means the past accumulates, forever, on every machine that participates.

The interesting question is not whether this happens. It is who pays for it.

## The bill nobody sends

On Ethereum, you pay gas to write a value into contract storage. You pay once. After that the value sits there, and every node in the world stores it indefinitely, for free, forever.

CKB's own founding document describes the arrangement without flinching: existing chains "allow a user to pay once and have their data occupy full nodes' storage forever." [1] One person decides to store a few bytes. A few hundred thousand strangers pay to keep those bytes alive. The cost is real. It is simply not on the bill.

This is why Ethereum researchers spend so much time on "state growth." As the state expands, every node must hold more of it. One proposal, EIP-6800, lays out the math bluntly: today a single account access needs a witness of roughly 3 kilobytes on average, and a worst-case block could require about 18 megabytes of witness data, which is too much to broadcast safely inside a 12-second slot. A new tree structure would cut that to about 200 bytes per account. [2]

It is worth being precise here, because this is where hype usually enters. EIP-6800 is marked **Stagnant**. It is a research direction, not a shipped fix. The honest reading is not "Ethereum is broken." It is "the bill for permanent data is now large enough that serious people are redesigning the accounting."

Bitcoin has a smaller version of the same problem. Its live money is not an account balance but a set of unspent outputs, UTXOs, scattered across the chain. A full node must track them to validate new transactions. [3] Bitcoin even has a cheaper path for data that will never be spent, precisely because data that enters the spendable set is data the network must carry indefinitely.

None of this is a scandal. It is a design choice, and it works well enough that both networks are worth trillions. But it hides a tradeoff: permanence is treated as free at the moment of writing, and expensive at the moment of maintaining.

## CKB's inversion

Nervos CKB takes the opposite position. It says storage is not free, and the person who wants it should be the one who pays.

State on CKB lives in cells: discrete objects with a capacity, a lock, an optional type script, and some data. [4] The rule is brutally simple. One byte of on-chain space costs one CKB. [5] If you want to store a thousand bytes, you lock a thousand CKB behind those bytes. Even an empty cell must reserve 61 CKBytes just to hold its own metadata. [5] That CKB is not spent. It is held, like a deposit on an apartment.

When you free the space, you get the deposit back.

So permanent data has a price, and the price is paid by the person who wants the data to persist. If you keep it forever, your capital stays locked forever. The cost of permanence is the opportunity cost of that capital. CKB's RFC says this almost in the language of economics: "users pay for storage with a cost that is proportional to both space and time." [1]

There is a subtle design decision buried in that sentence. CKB could have charged rent and reclaimed unused state when the rent ran out. It chose not to, arguing that an upfront payment "could be used up and the system would have to recycle the state and break any applications or contracts depend on it." [1] In other words: a chain that deletes your data when you stop paying is a chain that can delete your application. CKB prefers a deposit that never expires, even if that means the cost is paid as lost opportunity rather than a monthly bill.

This is a philosophy, not a magic trick. It does not make storage free. It makes the bill visible, and it puts it in front of the person writing the data instead of the strangers maintaining the chain.

## The part where I have to be honest

It would be easy to write that CKB invented this. It did not.

Solana, for instance, requires every account to hold "a refundable minimum lamport balance proportional to its data size to remain onchain." [6] Several chains price storage as a deposit. What is distinctive about CKB is not the existence of the idea but its centrality: the native token is defined as the right to occupy bytes, the entire state model is built around it, and the chain describes itself as a place for "common knowledge" rather than a place for payments.

That phrase comes from the CKB RFC, and it is the most interesting thing in the document. "Common knowledge refers to states that are verified by global consensus." [1] The ambition is bigger than coins: a place where a society can store the facts it needs to agree on, and keep them verifiable by anyone. The RFC even closes with a line from Hayek's 1945 essay on the division of knowledge. [1] A blockchain specification citing a mid-century economist is an odd and telling choice. It suggests the authors think of the chain as a memory for civilization, not a ledger for traders.

And that ambition runs straight into the problem from the opening. Common knowledge is not free to keep. A chain that promises to remember everything forever is making a promise that someone, eventually, has to pay for. CKB's answer is to make that promise explicit and priced.

## A chain that cannot forget is a chain that cannot forgive

If every action is permanent, then so is every mistake.

A bad trade. A leaked key. A youthful post. A business that failed. On a system that never forgets, these do not fade. They stay, verifiable, attached to an address, forever.

Human societies rely on forgetting. Records expire. Debts are discharged. People get to become someone else. A ledger that cannot forget is, in a quiet way, a society that cannot change.

CKB does not solve this moral problem. No chain does. But it does something rarer than pretending the problem away: it puts a price on memory, and it lets you reclaim the space when you choose to let go. You can store almost anything. You just cannot store it for free, and you cannot pretend the cost is someone else's.

That is not a complete answer. It is an honest one.

The real question was never whether blockchains should forget. It is who pays when they refuse to. Most chains answer that question by accident. CKB answers it on purpose.

---

## References

1. Jan Xie, "Nervos CKB: A Common Knowledge Base for Crypto-Economy," RFC 0002, Nervos RFCs. https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0002-ckb/0002-ckb.md
2. Vitalik Buterin et al., "EIP-6800: Ethereum state using a unified verkle tree," Ethereum Improvement Proposals (status: Stagnant). https://eips.ethereum.org/EIPS/eip-6800
3. Bitcoin Project, "Transactions," Bitcoin Developer Guide. https://developer.bitcoin.org/devguide/transactions.html
4. Nervos CKB Documentation, "Cell." https://docs.nervos.org/docs/tech-explanation/cell
5. Nervos CKB Documentation, "Capacity." https://docs.nervos.org/docs/tech-explanation/capacity
6. Solana Documentation, "Accounts." https://solana.com/docs/core/accounts

All sources accessed 20 November 2026.

---

*This is part of an ongoing series documenting progress through the CKBuilders program. The sources for every factual claim are listed above, and the limits of those claims are stated in the text.*

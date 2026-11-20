---
title: 'The Word "Basically"'
coverImage: 'images/cover.png'
category: Architecture
subtitle: "Vitalik's one-line compliment to CKB became the ecosystem's favorite quote. Read closely, it says something more interesting, and less flattering, than the victory lap."
date: '2026-11-20T00:00:00.000Z'
author:
- github:WuodOdhis
---

*Vitalik's one-line compliment to CKB became the ecosystem's favorite quote. Read closely, it says something more interesting, and less flattering, than the victory lap.*

---

In April 2025, Vitalik Buterin published a long proposal to replace the Ethereum Virtual Machine with RISC-V. Somewhere in the middle, he wrote one sentence about another chain:

> "One precedent for this is the Nervos CKB VM, which is basically RISC-V." [1]

The sentence is real. It has been quoted ever since, and rightly so. It is rare for Ethereum's founder to name another chain as a technical precedent. But the most important word in it is not "CKB." It is "basically."

Most writing about this stops at the compliment. CKB chose RISC-V first, Ethereum is now considering it, therefore CKB was ahead. That is a procurement fact, not an argument. The interesting question is what "basically" is hiding, because the gap between "basically RISC-V" and "RISC-V" is where every hard problem lives.

## An instruction set is a grammar

A processor does not understand Solidity, or JavaScript, or English. It understands a small set of binary patterns: add this, load that, compare these, jump there. That set is the instruction set architecture, or ISA. It is the grammar a machine can read.

Everything above it, every language, framework, and library, is eventually translated into that grammar. This is why the choice of ISA matters more than it first appears. It decides which tools can speak to the machine, and which tools must be rebuilt.

For most of computing history, that grammar belonged to a company. x86 belongs to Intel and AMD. ARM belongs to Arm Holdings. A blockchain that builds its own VM is doing something similar: it is inventing a private grammar, then asking the world to write compilers for it.

## The EVM is a constitution

Ethereum chose the second path. The EVM is not a standard chip language. It is a purpose-built machine with its own rules, its own economics, and its own idea of what a program is. That was a reasonable bet in 2015, and it produced an enormous ecosystem.

But a bespoke machine has a maintenance cost that compounds. Every new cryptographic primitive needs a new precompile, which needs a protocol change, which needs client implementations and coordinated activation. Ethereum has lived with this for a decade. It is why adding a new signature scheme is a governance event rather than a library import.

Vitalik's proposal is an attempt to escape that cost. His argument is not mainly that RISC-V is faster. It is that zero-knowledge provers already translate the EVM into RISC-V internally, so exposing RISC-V directly would "cut out the middleman" and remove a layer that has to be maintained forever. [1]

## What RISC-V actually offers

RISC-V is an open ISA with a small base and optional extensions. It is modular by design, and it has spent years accumulating the least glamorous and most valuable thing in computing: toolchains. Compilers, debuggers, libraries, and hardware that already exist and are already maintained by people who do not work for your blockchain. [2]

For a chain, that is the real prize. Cryptography stops being a protocol feature and becomes ordinary software. A developer can write a new verifier in Rust, compile it to RISC-V, and deploy it as a contract. No fork. No precompile. No committee. [2]

This is the promise that makes the precedent exciting, and it is genuinely exciting. But it is a promise about a family of machines, not a single machine.

## The distance between "basically" and "exactly"

CKB's VM is not simply "RISC-V." It is rv64imc: the 64-bit base, plus integer multiplication and division, plus compressed instructions. No floating point. No atomic instructions, because it runs single-threaded. Four megabytes of runtime memory. A W^X memory model with no MMU. Linux ELF as the contract format. Runtime cost measured in cycles. [2]

Every item on that list is a decision. Floating point is excluded because determinism across machines is hard and softfloat is possible. Atomics are unnecessary in a single-threaded model. W^X exists because a contract that can rewrite its own executable memory is a security disaster waiting to happen. Cycles are the unit of gas because the chain cannot charge for "time."

None of that appears in the phrase "basically RISC-V." All of it is the actual product. Saying a chain is "basically RISC-V" is like saying a car is "basically an engine." True. It tells you nothing about the brakes.

## Four problems the ISA does not solve

This is the part most articles skip. Choosing RISC-V is the easy step. The hard part is everything a general-purpose CPU assumes that a blockchain cannot allow.

**Determinism.** A normal program may read the clock, use random numbers, or depend on floating-point rounding that varies by hardware. A blockchain cannot. Every node must reach the same result from the same inputs, or consensus breaks. RISC-V does not give you determinism. You have to build it.

**Metering.** Gas must be charged per instruction before execution, not measured after it. That means defining a cycle model, mapping every instruction and syscall to a cost, and defending that model against griefing. The ISA gives you instructions. It does not give you an economy.

**Sandboxing.** A contract is hostile code by default. CKB's answer is a small, strict memory model with W^X and no MMU. That is not a property of RISC-V. It is a property of the VM built around it. [2]

**Versioning.** This is the deepest one, and the least discussed. An ISA can be stable while the machine around it still changes. CKB has shipped VM 0 at genesis, VM 1 in 2021 with the bit-manipulation extension, and VM 2 in 2024. Old scripts still run, and developers can choose to pin a script to a specific VM version or let it track upgrades. [3] That is a social and technical achievement, not an ISA feature. It is what lets a chain change without breaking the past.

The compliment names the choice. The four problems are the work.

## The twist: he was talking about proving

Here is the part that should make CKB supporters pause before claiming victory.

Vitalik's argument is about the proving layer. ZK provers already run the EVM on top of RISC-V, so giving developers RISC-V directly removes an interpreter. That is a claim about how to prove computation, not necessarily about how contracts should be delivered and stored.

In November 2025, four Offchain Labs researchers pushed back on exactly this point. They argued that Ethereum should separate the "delivery ISA" from the "proving ISA": use WASM as the format contracts ship in, and RISC-V as the backend that proves them. They also noted that proving costs have fallen to roughly $0.025 per block, which weakens the urgency of optimizing only for proof speed. [4] StarkWare made a related three-route argument earlier in 2025. [5]

So the precedent may prove something narrower than the celebration assumes. It may prove that RISC-V is the right thing to *prove*, while WASM or something else remains the right thing to *ship*. Those are different claims, and most of the quoting conflates them.

## What the compliment actually proves

It does not prove that CKB won. It proves that the question is real, and that CKB asked it early.

The real asset is not the ISA. It is the seven years of answers to the four problems above, tested on a live network since November 2019. [6] The choice of RISC-V takes an afternoon. The scaffolding takes a decade.

That is a less flattering reading, and a more useful one. The sentence is a door, not a trophy. What matters is what you build after you walk through it.

The useful version of "basically RISC-V" is not "we were right." It is "the hard part starts after the choice." Ethereum is still deciding. CKB is still maintaining. That is the sentence worth quoting.

---

## References

1. Vitalik Buterin, "Long-term L1 execution layer proposal: replace the EVM with RISC-V," Ethereum Magicians, April 20, 2025. https://ethereum-magicians.org/t/long-term-l1-execution-layer-proposal-replace-the-evm-with-risc-v/23617
2. Xuejie Xiao, "CKB-VM," RFC 0003, Nervos RFCs. https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0003-ckb-vm/0003-ckb-vm.md
3. Nervos CKB Documentation, "VM Version History." https://docs.nervos.org/docs/script/vm-version
4. Zack Abrams, "Offchain Labs challenges Vitalik's RISC-V proposal, says WASM better for Ethereum L1," The Block, November 23, 2025. https://www.theblock.co/news/ecosystems/2025-11-23-offchain-labs-challenges-vitaliks-risc-v-proposal-says-wasm-better-for-ethereum-l1-380070
5. StarkWare, "EVM 2.0: Proving-Centric vs. Execution-Centric Approaches," Ethereum Magicians, June 5, 2025. https://ethereum-magicians.org/t/evm-2-0-proving-centric-vs-execution-centric-approaches/24455
6. Nervos Network, "Nervos CKB Mainnet is Live," November 15, 2019. https://medium.com/nervosnetwork/nervos-ckb-mainnet-is-live-a028d9675dfb

All sources accessed 20 November 2026.

---

*This is part of an ongoing series documenting progress through the CKBuilders program. The sources for every factual claim are listed above, and the limits of those claims are stated in the text.*

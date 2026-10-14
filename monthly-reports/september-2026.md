# September 2026: Researching AI Agents on CKB

**Dates:** September 2026
**Report written:** October 14, 2026

September was a research month, not a build month. My instructor shared the ecosystem's opportunity map, *"AI, machine payments, and Fiber in 2026: an opportunity map for CKB and Fiber developers"*, as the starting brief for my research into how AI agents can integrate with CKB. I spent the month studying that document and the work it points to. I did not submit a grant, and I did not settle on one idea. That was on purpose.

## The Brief

The opportunity map (published on Nervos Talk on August 26, 2026) sorts the AI and Fiber space into eight areas. Each area is placed by two questions: how much it depends on specific Fiber and CKB properties, and how much public evidence exists for the real user problem behind it. It also sorts them into four positions: reuse now, validate next, build after recurring traffic appears, and frontier hypotheses. This is a method for choosing where to build, not a list of finished ideas.

Two instructions in the map shaped my month:

- **Reuse existing components first.** Before writing anything, inspect what already runs: x402 payment patterns, paid AI calls, receipts, browser sessions, and liquidity tooling.
- **Produce evidence the ecosystem does not have yet.** Working demos are common. Independent users, measured failure rates, and reproducible results are not.

## Studying What Already Exists

Following the brief, I mapped the projects named in the map against the ecosystem's recent results, which are all dated:

- **Gone in 60ms hackathon results (August 30, 2026):** 66 submissions. *Clasp* won overall with scoped, revocable wallet sessions for AI agents. *Fiber LSP Kit* placed second in the liquidity category with just-in-time inbound channel capacity for merchants. *FiberNuts* won category three with Cashu ecash settled over Fiber.
- **FiberPass (Spark Program):** a prepaid payment-session layer submitted on September 2 and **rejected on September 10**. The committee gave two reasons: overlap with Clasp, and use of the deprecated Lumos stack.
- **FNN v0.9.1 (September 11, 2026):** core releases continue. Advanced liquidity management is still unreleased, and the docs say it becomes ready for integration only at a later milestone.
- **Infern and AgentPay** already prototype paid model serving and hold-invoice escrow between agents.

The pattern is clear. The obvious ideas, such as another agent wallet, another payment session layer, or another LSP, already have credible and sometimes award-winning implementations. The FiberPass decision arrived mid-month and was a concrete reminder of what happens when an application skips this kind of check.

## Why I Did Not Submit Anything

Earlier in this journey I applied for grants too quickly, before I had properly mapped the existing work. Those attempts failed for exactly that reason: they proposed what had already been built. That was a failure of research discipline, not of ideas.

September produced no submission because the research was not finished. The map made it clear that any grant here must answer two questions before it is written: what does this build on top of what already exists, and what evidence would it produce that nobody else has? I could not answer those honestly during the month, so I did not apply. Ending the month with reading instead of a rushed proposal is the correction to how I applied before.

## Strongest Ideas So Far

The screening produced three candidate directions. They are the strongest so far, not settled choices. Each still has to pass the same test: a clear gap in existing work, and evidence it could add that nobody else has.

**1. Reliable transaction execution for CKB agents.**
An agent submits a payment or transaction, the network times out, and the agent cannot tell whether it succeeded. Retrying may pay twice. Abandoning may leave a paid task unfinished. The candidate project is a small execution layer that records intent, reconciles unclear outcomes, and recovers after a restart, built on CCC. Every payment area in the map assumes an agent can execute and recover a transaction safely, so this sits underneath all of them. One piece already exists: CKB Agent Skills lists an idempotent transfer pattern. What needs checking is whether crash recovery and outcome reconciliation are still missing.

**2. Portable service rights for agents.**
An agent buys access to a service, but the entitlement lives only in that provider's database. A second provider cannot verify or accept it. The candidate is a narrow CKB entitlement, represented as a cell, that two independent services recognise, with delegation and revocation. This matches the map's PPR area (payment-linked portable rights), which the map itself calls an untested frontier. The hard part is demand: no blockchain design can force a service to honour a right. Two willing providers must exist first.

**3. Buying services across Lightning and Fiber.**
A buyer holds BTC on Lightning while a service accepts a CKB asset through Fiber. The candidate is an application flow that quotes, converts through existing CCH tooling, purchases, and recovers interrupted orders. This matches the map's LFB area (Lightning and Fiber bridging), also a frontier hypothesis. Existing pieces include AgentPay's proposed flow and the CCH Daily Smoke automated tests. The gap is a real service and an independent buyer, not another bridge wrapper.

## Next

- Read back through my own CKB material in this repo (`concepts/`, earlier logs) to firm up the foundations the map assumes: the cell model, script lifecycle, and Fiber channel primitives.
- Finish comparing the three candidates against what Clasp, Fiber LSP Kit, and FNN itself already provide, including the maintainers' stated plans.
- Decide only after that whether a gap exists worth applying for, and write any proposal from the gap analysis, not before it.

## Takeaway

The deliverable of September is a map, a standard, and three candidates to test. Study the existing work first, define the evidence your project would add, and apply only when both are clear. That is the opposite of how I applied previously, and it is why this month ends with a documented research trail rather than another rushed submission.

---

**Sources studied:** [AI, machine payments, and Fiber in 2026](https://talk.nervos.org/t/ai-machine-payments-and-fiber-in-2026-an-opportunity-map-for-ckb-and-fiber-developers/10665) (Aug 26, 2026) · [Gone in 60ms results](https://talk.nervos.org/t/gone-in-60ms-fiber-network-infrastructure-hackathon-results/10671) (Aug 30, 2026) · [Spark FiberPass proposal and decision](https://talk.nervos.org/t/spark-program-fiberpass-spending-permission-infrastructure-for-fiber-network/10679) (Sep 2-10, 2026) · [FNN v0.9.1 release](https://github.com/nervosnetwork/fiber/releases/tag/v0.9.1) (Sep 11, 2026) · [Infern](https://talk.nervos.org/t/introducing-infern-serve-an-ai-model-from-your-own-machine-and-get-paid-per-request-over-fiber/10408) · [AgentPay](https://talk.nervos.org/t/agent-pay-btc-first-agent-pay/10086) · [CKB Agent Skills](https://github.com/pipixia-ckb/ckb-agent-skills) · [CCH Daily Smoke](https://github.com/sunchengzhu/cch-daily-smoke)

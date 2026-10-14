# September 2026: Researching AI Agents on CKB

**Dates:** September 2026
**Report written:** October 14, 2026

September was a research month, not a build month. My instructor shared the ecosystem's opportunity map, *"AI, machine payments, and Fiber in 2026: an opportunity map for CKB and Fiber developers"*, as the starting brief for my research into how AI agents can integrate with CKB. The month was spent studying that document and the work it points to. No grant was submitted, and no idea was settled — deliberately.

## The Brief

The opportunity map (Nervos Talk, published August 26, 2026) organizes the AI-and-Fiber space into eight opportunity areas, positioned against two questions: how much a project depends on specific Fiber and CKB properties, and how much public evidence exists for the user problem behind it. Its four positions — reuse now, validate next, build after recurring traffic appears, frontier hypotheses — are a method for choosing where to build, not a menu of finished ideas.

Two instructions in it shaped the month:

- **Reuse existing components first.** Before writing anything, inspect what already runs: x402 payment patterns, paid AI calls, receipts, browser sessions, liquidity tooling.
- **Produce evidence the ecosystem does not have yet.** Working demos are common. Independent users, measured failure rates, and reproducible results are not.

## Studying What Already Exists

Following the brief, I mapped the referenced projects against the ecosystem's recent, dated results:

- **Gone in 60ms hackathon results (August 30, 2026):** 66 submissions. *Clasp* won overall with scoped, revocable wallet sessions for AI agents. *Fiber LSP Kit* placed second in the liquidity category with just-in-time inbound channel capacity for merchants. *FiberNuts* won category three with Cashu ecash settled over Fiber.
- **FiberPass (Spark Program):** a prepaid payment-session layer submitted September 2 and **rejected on September 10**. The committee's stated reasons were overlap with Clasp and use of the deprecated Lumos stack.
- **FNN v0.9.1 (September 11, 2026):** core releases continue; advanced liquidity management remains unreleased and is documented as becoming integration-ready only at a later milestone.
- **Infern and AgentPay** already prototype paid model serving and hold-invoice escrow between agents.

The pattern is consistent: the obvious ideas — another agent wallet, another payment session layer, another LSP — already have credible, sometimes award-winning implementations. The FiberPass decision in particular was a concrete reminder, arriving mid-month, of what happens when an application skips the gap analysis.

## Why I Did Not Submit Anything

Earlier in this journey I applied for grants too quickly, before I had properly mapped the existing work. Those attempts failed for exactly that reason: they proposed what had already been built. That was a failure of research discipline, not of ideas.

September produced no submission because the research was not finished. Studying the map made clear that any grant in this space must answer two questions before it is written: *what does this build on top of what already exists, and what evidence would it produce that nobody else has?* I could not answer those honestly during the month, so I did not apply. Ending the month with reading instead of a rushed proposal is the correction to how I applied before.

## Current Status

- Opportunity map studied; its eight areas and four positions are summarised above.
- Existing ecosystem inventory verified against dated sources: hackathon results, the Spark Program decision, FNN releases, and the community projects each source names.
- Earlier grant failures diagnosed: insufficient research before application.
- No grant idea settled yet — the comparative gap analysis is in progress, not complete.

## Next

- Read back through my own CKB material in this repo (`concepts/`, earlier logs) to firm up the foundations the map assumes: the cell model, script lifecycle, and Fiber channel primitives.
- Finish comparing two or three surviving research directions against what Clasp, Fiber LSP Kit, and FNN itself already provide.
- Decide only after that whether a gap exists worth applying for — and write the proposal from the gap analysis, not before it.

## Takeaway

The deliverable of September is a map and a standard: study the existing work first, define the evidence your project would add, and apply only when both are clear. That is the opposite of how I applied previously, and it is why this month ends with a documented research trail rather than another rushed submission.

---

**Sources studied:** [AI, machine payments, and Fiber in 2026](https://talk.nervos.org/t/ai-machine-payments-and-fiber-in-2026-an-opportunity-map-for-ckb-and-fiber-developers/10665) (Aug 26, 2026) · [Gone in 60ms results](https://talk.nervos.org/t/gone-in-60ms-fiber-network-infrastructure-hackathon-results/10671) (Aug 30, 2026) · [Spark FiberPass proposal and decision](https://talk.nervos.org/t/spark-program-fiberpass-spending-permission-infrastructure-for-fiber-network/10679) (Sep 2–10, 2026) · [FNN v0.9.1 release](https://github.com/nervosnetwork/fiber/releases/tag/v0.9.1) (Sep 11, 2026) · [Infern](https://talk.nervos.org/t/introducing-infern-serve-an-ai-model-from-your-own-machine-and-get-paid-per-request-over-fiber/10408) · [AgentPay](https://talk.nervos.org/t/agent-pay-btc-first-agent-pay/10086)

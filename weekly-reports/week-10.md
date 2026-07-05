# Week 10: Preparing for the Fiber Development Hackathon

**Dates:** July 5, 2026

This week I shifted from the CellScript AMM builder work into preparation for the
Fiber development hackathon. I am not documenting the project idea publicly yet,
but I spent the week studying the parts of Fiber that matter for building real
applications on top of the network.

The main goal was to understand Fiber from the builder side: how a node is run,
how channels are created, how invoices move through their lifecycle, and what
kind of control an application can realistically get through the current RPC
interface.

## What I Studied

I focused on the Fiber node rather than only reading high-level descriptions.
The important areas were:

- the `fnn` node and how it fits beside CKB;
- Fiber's JSON-RPC and WebSocket interfaces;
- peer connection flow through `connect_peer`;
- channel creation through `open_channel` and `accept_channel`;
- channel state tracking from funding negotiation to `ChannelReady` and `Closed`;
- invoice creation, lookup, settlement, and cancellation;
- payment sending and payment status checks;
- the relationship between Fiber channels and CKB's Cell-based funding model;
- external wallet signing for channel funding;
- the current warning that Fiber APIs are still evolving.

This helped me separate what is already buildable from what still requires
protocol-level support.

## Fiber RPC Notes

The useful discovery is that Fiber already exposes many of the primitives needed
for application-level experiments:

- `connect_peer` for establishing node connectivity;
- `open_channel` and `accept_channel` for channel operations;
- `list_channels` for observing channel state;
- `new_invoice`, `get_invoice`, `settle_invoice`, and `cancel_invoice` for invoice lifecycle work;
- `send_payment` and `get_payment` for payment flow testing.

That means a hackathon prototype can be built around real node behavior instead
of only mocked flows.

The limitation is equally important: Fiber does not currently expose every event
hook an application developer might want. In particular, some flows need polling
instead of native event subscriptions. That changes how a prototype should be
designed, because the application has to be honest about timing, state checks,
and failure recovery.

## Invoices and Channels

I spent extra time looking at invoices because they are the application-facing
surface most users will eventually touch.

Fiber invoices are BOLT11-compatible, but Fiber is not just a Lightning clone.
The asset model is broader, with CKB and UDT support, and the underlying channel
funding lives in CKB's Cell model rather than Bitcoin's UTXO model.

The channel lifecycle is also important for UX. A builder has to understand that
opening a channel is not just a function call. It moves through states, depends
on funding, and may take time before the channel is actually usable.

That means a good Fiber app needs clear state handling around:

- request created;
- invoice created;
- payment detected;
- channel opening started;
- channel ready;
- payment settled or cancelled;
- failure or timeout.

## What This Means for the Hackathon

The preparation changed how I am thinking about the hackathon build. The best
demo will not be the one that promises the most abstract protocol vision. It
will be the one that shows a narrow, working flow using Fiber's current APIs.

So my focus is now on a practical prototype that can run on devnet, expose the
right state transitions, and make the Fiber node's behavior visible enough for a
technical demo.

I am deliberately keeping the exact project direction private for now. The public
log should show the learning path and the engineering boundaries without giving
away the implementation angle before the hackathon.

## Takeaway

The main takeaway this week is that Fiber is already usable enough for serious
experimentation, but the current API surface still requires careful application
design.

The builder has to work with the primitives that exist today: RPC calls, invoice
state, channel state, payment status, and devnet validation. That is enough for a
focused hackathon demo, as long as the scope is narrow and the prototype does not
pretend Fiber has features that are not exposed yet.

## Next

Next I want to turn the research into a runnable devnet workflow:

1. Set up the Fiber node environment cleanly.
2. Verify invoice creation and payment status polling.
3. Verify channel opening and channel state transitions.
4. Write a small service that coordinates the flow through Fiber RPC.
5. Keep the public writeup focused on infrastructure learning until the hackathon submission is ready.

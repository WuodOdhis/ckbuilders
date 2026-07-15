# Week 11: Building a Receive-First Fiber LSP Prototype

**Dates:** July 12-15, 2026

This week moved from Fiber research into the actual hackathon build. The project
became a receive-first liquidity service for Fiber: a small LSP daemon that lets
a recipient receive a Fiber payment without first creating or funding inbound
liquidity.

The scope stayed deliberately narrow. The prototype does not fork Fiber, does not
implement custom TLC/PTLC logic, and does not claim that the recipient needs no
CKB at all. The practical claim is more specific:

```text
The recipient does not pre-fund inbound Fiber liquidity.
The recipient still needs a small CKB reserve for current Fiber/CKB channel acceptor mechanics.
```

That distinction became important while testing, because Fiber channel acceptance
still depends on CKB cell capacity even when the LSP is funding the payment path.

## What Was Built

The main repository is:

```text
https://github.com/WuodOdhis/fiber_pi
```

The project now has three main pieces:

- `crates/lspd`: a Rust JSON-RPC daemon that coordinates the LSP flow;
- `demo-ui`: a browser dashboard for the payment lifecycle;
- `scripts`: local and Codespaces scripts for running a full Fiber testnet demo stack.

The daemon exposes a small API:

- `get_info`, for daemon and LSP Fiber node information;
- `buy`, for creating a receive-first order and sender-facing Fiber invoice;
- `get_order_status`, for order state, invoice state, audit events, and recipient channel snapshots.

Under the hood, it uses Fiber node RPC directly:

- `connect_peer`;
- `list_peers`;
- `new_invoice`;
- `get_invoice`;
- `open_channel`;
- `list_channels`;
- `send_payment`;
- `get_payment`;
- `settle_invoice`.

## The Payment Flow

The working flow is:

1. A client calls `buy` with a recipient pubkey and amount.
2. `lspd` creates a Fiber hold invoice on the LSP node.
3. The sender pays the LSP invoice.
4. `lspd` observes the invoice move to `Received`.
5. The daemon checks whether an existing LSP-to-recipient channel can carry the net amount.
6. If not, the LSP opens a private one-way recipient channel.
7. The LSP pays the recipient with Fiber keysend.
8. Only after the recipient payment succeeds does the daemon settle the sender invoice.

The important part is the ordering. The sender invoice is not settled just because
the sender paid. It is settled after the recipient-side Fiber payment succeeds.

## Debugging Boundaries

The most useful bugs were all around real Fiber behavior rather than application
syntax.

First, `ChannelReady` responses sometimes omit `state_flags`, so the model had to
treat that field as optional/defaulted instead of assuming it is always present.

Second, `open_channel` returns before a channel is usable. The daemon had to poll
`list_channels` and wait for `ChannelReady` instead of treating a temporary
channel id as success.

Third, failed or timed-out payments can leave inflight TLCs that temporarily
consume outbound liquidity. That changed the demo scripts: they now make the
target payment amount explicit and check usable outbound liquidity before running
the demo.

Fourth, recipient channel auto-accept exposed a CKB-specific detail. Opening a
channel for only the net amount after fees could fall below the recipient's
auto-accept funding threshold. The daemon now funds CKB recipient channels with a
floor that accounts for Fiber's reserved capacity and the auto-accept minimum.

Finally, Fiber's `connect_peer` response can be awkward in some cases. The daemon
now treats an empty `connect_peer` response as recoverable if a follow-up
`list_peers` confirms that the peer is connected.

## Verified Result

The working demo proves the claim through Fiber RPC state:

```text
recipient list_channels before payment => []
sender get_payment(payment_hash) => Success
get_order_status(order_id) => COMPLETED
invoice_status => Paid
recipient list_channels after payment => ChannelReady
recipient channel is_acceptor => true
recipient channel is_one_way => true
recipient local_balance increases by the net amount
```

The recipient channel also includes a `channel_outpoint`. The first 32 bytes of
that outpoint are the CKB funding transaction hash, which proves the channel was
funded on-chain. The payment itself is off-chain Fiber state, so its proof comes
from `get_payment`, `get_order_status`, and the recipient channel balance.

## Demo Evidence

The screenshots below capture the final demo path and the main proof points:

- [Demo Runbook Checklist](../logs/week-11/screenshots/demo-runbook-checklist.png)
- [Recipient Zero-Channel Proof](../logs/week-11/screenshots/recipient-zero-channel-proof.png)
- [LSP Daemon API Listening](../logs/week-11/screenshots/lspd-api-listening.png)
- [Demo UI Before Payment](../logs/week-11/screenshots/demo-ui-before-payment.png)
- [First Receive Completed](../logs/week-11/screenshots/demo-ui-first-receive-completed.png)
- [Audit Trail and Channel Outpoint](../logs/week-11/screenshots/demo-ui-audit-and-outpoint.png)
- [Codespaces Demo Startup](../logs/week-11/screenshots/codespaces-demo-startup.png)

## Documentation and Demo Environment

I added public documentation for the project:

- `README.md`, for the project claim, architecture, API, limitations, and setup;
- `DEMO.md`, for a clean testnet demo runbook;
- `CODESPACES.md`, for running the full demo stack in GitHub Codespaces.

The Codespaces setup matters because a Fiber infrastructure demo needs a live
environment. The Codespace runs the full testnet stack:

- sender Fiber node;
- LSP Fiber node;
- recipient Fiber node;
- `lspd`;
- browser dashboard on a forwarded port.

Only the dashboard is made public. Fiber RPC ports stay local inside the
Codespace.

## Current Status

The project is now demo-ready as a hackathon infrastructure prototype.

It is not production-ready yet. The honest limitations are:

- orders are stored in memory;
- the API has no authentication;
- retry and recovery behavior is still minimal;
- channel funding policy is simple and CKB-focused;
- liquidity accounting is demo-grade rather than treasury-grade;
- the recipient still needs a small CKB reserve to accept Fiber channels.

But the core receive-first flow works against real Fiber testnet nodes, and the
demo can show the before/after recipient channel state clearly.

## Next

The next work would be to turn the prototype into something closer to an
integration component:

1. Add persistent order storage.
2. Add authenticated API access.
3. Make channel funding policy configurable instead of hardcoded.
4. Add stronger retry/recovery around interrupted orders.
5. Package a wallet or merchant integration example around the `buy` API.
6. Keep the project honest about what Fiber exposes today and what still needs protocol-level support.

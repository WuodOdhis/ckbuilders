# Day 3: Paying the Recipient Before Settlement

**Date:** July 14, 2026

## Objective

Close the main product correctness gap. The LSP should not only open a recipient
channel and settle the sender invoice. It should pay the recipient net amount
over Fiber first, then settle the sender invoice after that recipient payment
succeeds.

## Recipient Payment Support

Added Fiber RPC client methods for:

- `send_payment`;
- `get_payment`.

The settlement path now does this:

1. transition the order to `SETTLING`;
2. send a keysend payment from the LSP Fiber node to the recipient;
3. poll `get_payment` until the recipient payment is `Success`;
4. settle the original sender invoice;
5. mark the order `COMPLETED`.

This changes the project from a channel-provisioning demo into a real
receive-first payment flow.

## Auto-Accept Funding Issue

Testing exposed an important CKB-specific boundary. Recipient nodes have an
auto-accept minimum for CKB channel funding. If the LSP opens the channel for
only the net amount after fees, the payable channel amount can fall below the
recipient's auto-accept threshold.

The fix was to fund CKB recipient channels with a floor that accounts for:

- Fiber reserved capacity;
- the recipient auto-accept minimum;
- the net amount that must be available for the recipient payment.

This was a useful reminder that the payment UX claim must not hide the CKB cell
mechanics underneath Fiber channels.

## Demo UI

Added a small browser dashboard to make the lifecycle visible:

- order status;
- gross amount;
- LSP fee;
- net recipient amount;
- recipient balance before/after;
- order event trail;
- Fiber channel table;
- channel outpoint.

The UI is intentionally local and lightweight. It is a dashboard for proving the
infrastructure flow, not a full wallet.

## Verified Result

The verified success condition became:

```text
sender payment status: Success
order status: COMPLETED
invoice status: Paid
recipient local_balance increased by net amount
recipient channel is_acceptor: true
recipient channel is_one_way: true
```

## Next

Harden the demo scripts and deployment path so the project can be tested without
manual node debugging.

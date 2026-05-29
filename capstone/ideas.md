# Capstone Ideas

## Future Todo: Harden CKB Agent Lock

Not for today, but this is probably the strongest capstone direction so far.

- Position **CKB Agent Lock** as the main capstone project: a programmable CKB lock that lets an off-chain agent authorize claims for Web2 identities.
- Add an app-level README for `experiments/agent-lock` with a clear end-to-end demo path.
- Harden the claim flow:
  - prevent double claims robustly
  - document trust assumptions around the agent private key
  - add clear UI failure states
  - clean up config and environment setup
  - write a short audit section covering replay risk, frontrunning, witness format, and admin trust
- Consider one contained extension: support multiple authorization policy types in the architecture, starting with Telegram username allowlists but leaving room for GitHub, Discord, or email-based identity later.

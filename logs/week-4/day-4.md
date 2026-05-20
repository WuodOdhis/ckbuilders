# Day 4: Building the CKB Agent Lock Product

**Date:** May 21, 2026

## Objective
Turn the agent-lock experiment into a production-ready, full-stack Web2-to-Web3 bridge that any DAO can use to reward its community without managing addresses.

## What I Built

### Express API Server
Wrapped the deploy and spend logic into a proper Express server with REST endpoints:
- `POST /api/admin/lock` - Lock a reward pool for N Telegram users (pro-rata split)
- `POST /api/challenge` - Generate a verification challenge code
- `GET /api/status?code=X` - Poll challenge verification status
- `POST /api/user/claim` - Build, sign, and broadcast the spend transaction
- `GET /api/admin/status` - Real-time pool state (who claimed, remaining balance)

### Admin Dashboard (`admin.html`)
A standalone page where the admin locks reward pools and monitors claims in real time. Shows total locked, claimed vs pending counts, remaining CKB, and a per-recipient status list that updates every 5 seconds via polling.

### User Claim Portal (`portal.html`)
A clean, single-purpose page where users enter their Telegram username and CKB address, get a challenge code, verify via the Telegram bot, and claim their CKB with one click.

### Telegram Bot Integration
Long-polling loop that listens for `/verify <code>` messages from users, confirms the Telegram username matches the challenge, and marks the challenge as verified.

## Technical Decisions

- **Static HTML/CSS/JS** instead of React - no build step, serves directly from Express, easier to onboard DAO contributors
- **Pool state in memory** - single-pool model for simplicity; resets on server restart
- **Raw `_signMessage`** - bypasses CKB's message prefixing for direct tx hash signing, needed for the on-chain verification
- **Express static file serving** - both pages served from same origin, no CORS issues

## The Flow End-to-End

1. Admin opens dashboard, enters 10000 CKB and 2 usernames, clicks Lock
2. One transaction creates 2 cells on devnet, each locked by the Agent script with the Agent's pubkey hash
3. User1 visits portal, enters username and address, clicks Check - gets a 6-digit code
4. User1 sends `/verify <code>` to @ckbagentbot on Telegram
5. Bot confirms username matches, marks challenge verified
6. User1 clicks Claim - server builds spend tx, Agent signs it, broadcasts to devnet
7. Admin dashboard updates instantly - User1 shows as Claimed, remaining balance drops

## What Made It Click

This was the first time in the program where I wasn't following a guide. I had a problem I wanted to solve (admins shouldn't manage addresses), I understood CKB's lock script model deeply enough to see the solution, and I just built it. The lock script handles the cryptographic auth, the Telegram bot handles the identity proof, and the UI makes it usable by anyone with a browser.

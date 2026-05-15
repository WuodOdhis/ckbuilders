# Week 2: Practical dApp Dev & Layer 2

**Dates:** April 29 – May 4, 2026

Moved from theory to writing actual transactions this week. The goal was to interact with the local devnet using a frontend, store data on-chain, and mint a fungible token.

## JoyID & CCC Integration
Integrated the JoyID passkey wallet into the React app using the CCC SDK. Wrapping the app in `ccc.Provider` abstracts a lot of the connection logic. It's interesting how JoyID uses WebAuthn instead of seed phrases—definitely a better UX for mainstream users.

## Data Storage & State Rent
Wrote a simple script to store the string "Building on CKB Devnet from scratch!" in the `outputsData` field of a new cell. 

The tricky part here was calculating the required capacity. CKB operates on a "1 CKB = 1 Byte" state rent model. You have to calculate the exact serialized size of the cell (including the lock script) and ensure the cell holds enough CKB to cover it. The cool part is that this capacity acts as a deposit—when you destroy the cell later, you get the CKB back. It's a natural deterrent against state bloat.

## Minting xUDT
Minted 1,000,000 units of an xUDT (Extensible User Defined Token). 
The process involves:
1. Putting the token amount as a 128-bit little-endian integer in the cell data.
2. Attaching the xUDT Type Script to define the rules.
3. Setting the owner's Lock Script Hash in the `args` of the Type Script (this is essentially the mint key).
4. Including the xUDT system script in the transaction's `cellDeps` so the VM knows where to load the logic from.

Had a debugging moment where I realized `ClientPublicTestnet` in CCC hardcodes testnet system scripts, which don't match a fresh `offckb` devnet. Had to patch the config to make the transactions pass.

## Fiber Network
Spent some time reading up on Fiber, CKB's Layer 2 payment channel network. It's conceptually similar to Bitcoin's Lightning Network but leverages CKB's scriptability.
Because CKB uses Turing-complete RISC-V scripts instead of limited Bitcoin Script, Fiber can handle cross-asset channels (routing CKB and xUDT simultaneously) and programmable HTLCs. It's a solid architecture for high-throughput, low-fee microtransactions.

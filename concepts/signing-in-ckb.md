# Signing in CKB — Why It's Hard

In Ethereum, signing is simple: RLP-serialize, keccak256, secp256k1-sign, done. The protocol handles everything.

In CKB, the signer must reconstruct the exact hash the on-chain lock script will compute. Every SDK implements this differently, and a single byte mismatch produces error -31.

## The Sighash Algorithm (SighashAll)

The secp256k1 lock script computes:

```
tx_hash = blake2b(raw_transaction_without_witnesses)
sighash = blake2b(tx_hash || witness[0] || witness[1] || ...)
```

Where each witness is 8-byte-length-prefixed. The witness at the signing position has its lock field **zeroed out** (65 bytes of zeros).

## Three Common Failure Modes

### 1. No Witness Placeholder

Before signing, a `WitnessArgs` with a 65-byte zeroed lock field must be in the witness array. If you skip this step, the hash is computed over an empty witness, which differs from what the lock script computes.

**Fix:** Call `prepareTransaction()` before `signOnlyTransaction()`.

### 2. Wrong Transaction Hash

If your SDK serializes the transaction differently than the CKB node (different field order, wrong endianness, missing fields), the tx_hash differs.

**Fix:** Verify the raw molecule bytes match what `get_transaction` returns.

### 3. Wrong Genesis Hash

If you query `get_live_cell` with a non-existent genesis outpoint, it returns "unknown". You waste hours debugging signing when the input doesn't exist.

**Fix:** Verify the genesis tx hash by calling `get_block_by_number(0)`.

## The always_success Escape Hatch

The lock script with `code_hash = 0x00..00, hash_type = data1, args = 0x` always returns success. Spend it with zero proof. Deploy one once and skip signing for all test transactions.

## CCC Monkey-Patch

The `@ckb-ccc/core` SDK has no `getKnownScript` for devnet. Monkey-patch:

```javascript
client.getKnownScript = async (name) => {
    const scripts = {
        'Secp256k1Blake160': {
            codeHash: '0x9bd7e0...',
            hashType: 'type',
            cellDeps: [{
                cellDep: {
                    outPoint: { txHash: '0x4d804f...', index: 0 },
                    depType: 'depGroup'
                }
            }]
        },
    };
    return scripts[name];
};
```

Note: `cellDep` (singular) wrapper key, `index` is a number, `depType` is camelCase.

## Error Reference

| Error | Meaning |
|-------|---------|
| -31 | Signature doesn't match public key |
| -302 | Script validation failed (see error URL) |
| `Unknown(OutPoint)` | Input cell doesn't exist |
| `InsufficientCellCapacity` | Output too small for its data |

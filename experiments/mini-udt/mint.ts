import { ccc } from "@ckb-ccc/core";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createDevnetClient, ACCOUNTS } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const client = createDevnetClient();
  const signer = new ccc.SignerCkbPrivateKey(client, ACCOUNTS.primary);
  const ownerAddressObj = await signer.getRecommendedAddressObj();
  
  // The owner's lock script hash is the exact 32-byte identifier we will put in the Type Script args
  const ownerLockHash = ownerAddressObj.script.hash();
  
  console.log("Using primary wallet:", ownerAddressObj.toString());
  console.log("Owner Lock Script Hash:", ownerLockHash);

  // ----------------------------------------------------------------------
  // STEP 1: Deploy the Mini-UDT Binary to Devnet
  // ----------------------------------------------------------------------
  console.log("\n--- STEP 1: DEPLOYING MINI-UDT SCRIPT ---");
  const binaryPath = path.resolve(__dirname, "../../ckb-scripts/mini-udt/build/release/mini-udt");
  if (!fs.existsSync(binaryPath)) {
    throw new Error(`Compiled binary not found at ${binaryPath}`);
  }
  
  const binaryBuffer = fs.readFileSync(binaryPath);
  const dataHex = ccc.hexFrom(binaryBuffer);

  const txDeploy = ccc.Transaction.from({
    outputs: [{ lock: ownerAddressObj.script, capacity: 0n }],
    outputsData: [dataHex],
  });

  const occupied = BigInt(txDeploy.outputs[0].occupiedSize);
  const binaryLen = BigInt(binaryBuffer.length);
  txDeploy.outputs[0].capacity = (occupied + binaryLen) * 100000000n;

  await txDeploy.completeInputsByCapacity(signer);
  await txDeploy.completeFeeBy(signer, 1000n);

  const deployTxHash = await signer.sendTransaction(txDeploy);
  console.log("Deployment transaction sent! Tx Hash:", deployTxHash);

  // Calculate the Type Script's properties based on the deployment
  const codeHash = ccc.hashCkb(binaryBuffer);
  
  // We construct the Type Script configuration. 
  // Notice we pass `ownerLockHash` as the args!
  const miniUdtTypeScript = ccc.Script.from({
    codeHash: codeHash,
    hashType: "data2",
    args: ownerLockHash,
  });

  console.log("Waiting for block confirmation...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // ----------------------------------------------------------------------
  // STEP 2: Mint 1 Billion Tokens!
  // ----------------------------------------------------------------------
  console.log("\n--- STEP 2: MINTING 1 BILLION MINI-UDT TOKENS ---");

  // A token balance in sUDT is a 16-byte (128-bit) unsigned integer in little-endian format.
  // We want to mint 1,000,000,000 tokens.
  const mintAmount = 1000000000n;
  
  // Convert 1,000,000,000n to a 16-byte little-endian hex string
  const amountBuffer = Buffer.alloc(16);
  amountBuffer.writeBigUInt64LE(mintAmount, 0); // Fits in the first 8 bytes
  const amountHex = ccc.hexFrom(amountBuffer);

  const txMint = ccc.Transaction.from({
    outputs: [
      {
        lock: ownerAddressObj.script, // You own the tokens
        type: miniUdtTypeScript,      // Apply the Mini-UDT rules to this cell
        capacity: 0n,
      }
    ],
    outputsData: [amountHex], // The cell's data is the token balance
    cellDeps: [
      {
        outPoint: {
          txHash: deployTxHash, // Depend on the script we just deployed
          index: 0n,
        },
        depType: "code",
      }
    ],
  });

  // Calculate the required CKB capacity to hold this token cell
  // occupiedSize covers: 8 (capacity) + lock script + type script
  // We must also cover the 16 bytes of cell data (the u128 token balance)
  const occupiedBytes = BigInt(txMint.outputs[0].occupiedSize) + 16n;
  txMint.outputs[0].capacity = occupiedBytes * 100000000n;
  console.log(`Cell requires ${Number(txMint.outputs[0].capacity / 100000000n)} CKB of storage capacity.`);

  console.log("Completing inputs for minting...");
  // This automatically adds input cells from our primary wallet.
  // Because our primary wallet's lock script hash matches the type script's args,
  // the on-chain Mini-UDT script will see the owner is present and authorize the mint!
  await txMint.completeInputsByCapacity(signer);
  
  console.log("Completing fee for minting...");
  await txMint.completeFeeBy(signer, 1000n);

  console.log("Signing and broadcasting minting transaction...");
  const mintTxHash = await signer.sendTransaction(txMint);
  
  console.log("\nSuccess! 1,000,000,000 Mini-UDT tokens successfully minted.");
  console.log("Mint Tx Hash:", mintTxHash);
}

main().catch(console.error);

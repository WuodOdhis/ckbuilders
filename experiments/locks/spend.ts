import { ccc } from "@ckb-ccc/core";

// --- PASTE YOUR DEPLOYMENT DETAILS HERE AFTER RUNNING DEPLOY.TS ---
const DEPLOYED_TX_HASH = "0x3838fc9b70d49c54cee212ecec9d5f3d0c79135d1dcf6a50673fb81095763791";
const SCRIPT_CODE_HASH = "0xda460582613e42be8de68da386228e41cf3063c67cdbf1aeaafd0348a519ce73";
// -----------------------------------------------------------------

async function main() {
  if (DEPLOYED_TX_HASH.startsWith("PASTE_") || SCRIPT_CODE_HASH.startsWith("PASTE_")) {
    console.error("Error: Please run 'npm run deploy' first, and paste the deployed tx_hash and code_hash into this file!");
    process.exit(1);
  }

  const dummyClient = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114" });
  const myScripts = { ...dummyClient.scripts };
  
  // SECP256K1 Setup
  myScripts[ccc.KnownScript.Secp256k1Blake160] = {
    cellDeps: [{
      cellDep: {
        outPoint: {
          txHash: "0x4d804f1495612631da202fe9902fa9899118554b08138cfe5dfb50e1ede76293",
          index: 0n,
        },
        depType: "depGroup",
      }
    }],
    codeHash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hashType: "type",
  };

  const client = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114", scripts: myScripts });
  
  // Wallet to fund and receive the returned CKB
  const signer = new ccc.SignerCkbPrivateKey(client, "0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6");
  const addressObj = await signer.getRecommendedAddressObj();

  console.log("Using primary wallet:", addressObj.toString());

  const customLock = ccc.Script.from({
    codeHash: SCRIPT_CODE_HASH,
    hashType: "data1",
    args: "0x", // always-success does not require arguments
  });

  const customAddress = await ccc.Address.fromScript(customLock, client);
  console.log("Custom lock script address generated:", customAddress.toString());

  // 2. Fund the Custom Address (Send 200 CKB to it)
  console.log("\n--- STEP 1: FUNDING CUSTOM ADDRESS ---");
  const fundAmount = ccc.fixedPointFrom(200);
  const txFund = ccc.Transaction.from({
    outputs: [{ lock: customLock, capacity: fundAmount }],
    outputsData: ["0x"],
  });

  console.log("Completing inputs for funding...");
  await txFund.completeInputsByCapacity(signer);
  console.log("Completing fee for funding...");
  await txFund.completeFeeBy(signer, 1000n);

  console.log("Signing and sending funding transaction...");
  const fundTxHash = await signer.sendTransaction(txFund);
  console.log("Funding transaction sent! Tx Hash:", fundTxHash);

  console.log("Waiting for block confirmation...");
  // Wait a short time for local mining (usually instant on offckb devnet)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 3. Spend from the Custom Address
  console.log("\n--- STEP 2: UNLOCKING & SPENDING ---");
  
  // The cell we want to spend is at index 0 of our funding tx
  const customOutPoint = {
    txHash: fundTxHash,
    index: 0n,
  };
  
  const customCell = await client.getCell(customOutPoint);
  if (!customCell) {
    throw new Error(`Could not find the funded cell at ${fundTxHash} index 0.`);
  }

  const inputCapacity = customCell.cellOutput.capacity;
  console.log(`Funded cell found. Balance: ${Number(inputCapacity / 100000000n)} CKB`);

  // We redeem the capacity back to our secure SECP256K1 address
  // We specify 100,000 Shannons (0.001 CKB) as a fee, returning the rest
  const txSpend = ccc.Transaction.from({
    inputs: [{ previousOutput: customOutPoint }],
    outputs: [{ lock: addressObj.script, capacity: inputCapacity - 100000n }],
    outputsData: ["0x"],
    // We MUST include our deployed script cell in cellDeps so the VM can run it
    cellDeps: [
      {
        outPoint: {
          txHash: DEPLOYED_TX_HASH,
          index: 0n,
        },
        depType: "code",
      }
    ],
  });

  // Note: Since always-success is our lock script, it requires NO SIGNATURE or witness checks.
  // We can send this transaction directly without signing!
  console.log("Sending spend transaction without any signature...");
  const spendTxHash = await client.sendTransaction(txSpend);
  console.log("\nSuccess! Spend transaction mined.");
  console.log("Reclaimed CKB transaction hash:", spendTxHash);
  console.log("------------------------------------\n");
}

main().catch(console.error);

import { ccc } from "@ckb-ccc/core";

async function main() {
  // 1. Create a dummy client to grab the default Testnet scripts
  const dummyClient = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114" });
  const myScripts = { ...dummyClient.scripts };
  
  // 2. Patch ONLY the Secp256k1 script to match your Local Devnet
  myScripts[ccc.KnownScript.Secp256k1Blake160] = {
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash: "0x4d804f1495612631da202fe9902fa9899118554b08138cfe5dfb50e1ede76293",
            index: 0n,
          },
          depType: "depGroup",
        }
      }
    ],
    codeHash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    hashType: "type",
  };

  // 3. Initialize the real client with our patched scripts
  const client = new ccc.ClientPublicTestnet({
    url: "http://127.0.0.1:8114",
    scripts: myScripts
  });

  // 4. Connect Alice's Devnet Account
  const signer = new ccc.SignerCkbPrivateKey(
    client,
    "0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6"
  );
  
  const addressObj = await signer.getRecommendedAddressObj();
  console.log("Connected as:", addressObj.toString());

  // 5. Prepare the data
  const message = "Building on CKB Devnet from scratch!";
  const dataHex = "0x" + Buffer.from(message, "utf8").toString("hex");
  console.log("Storing message:", message);

  // 6. Build the Transaction
  const tx = ccc.Transaction.from({
    outputs: [{ lock: addressObj.script, capacity: 0n }],
    outputsData: [dataHex],
  });

  // 7. Calculate exact capacity needed (Lock Script + Data)
  tx.outputs[0].capacity = BigInt(tx.outputs[0].occupiedSize + ccc.bytesFrom(dataHex).length) * 100000000n;

  // 8. Sign and Send
  console.log("Signing and sending...");
  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000n);

  const txHash = await signer.sendTransaction(tx);
  console.log("✅ Success! Hash:", txHash);
}

main().catch(console.error);

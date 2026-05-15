import { ccc } from "@ckb-ccc/core";

async function main() {
  const dummy = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114" });
  const myScripts = { ...dummy.scripts };
  
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

  const client = new ccc.ClientPublicTestnet({
    url: "http://127.0.0.1:8114",
    scripts: myScripts
  });

  const signer = new ccc.SignerCkbPrivateKey(
    client,
    "0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6"
  );
  
  const addressObj = await signer.getRecommendedAddressObj();
  const dataHex = "0x" + Buffer.from("Testing mutation!", "utf8").toString("hex");
  const tx = ccc.Transaction.from({
    outputs: [{ lock: addressObj.script, capacity: 0n }],
    outputsData: [dataHex],
  });

  tx.outputs[0].capacity = BigInt(tx.outputs[0].occupiedSize + ccc.bytesFrom(dataHex).length) * 100000000n;

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000n);

  const txHash = await signer.sendTransaction(tx);
  console.log("Success! Hash:", txHash);
}

main().catch(console.error);

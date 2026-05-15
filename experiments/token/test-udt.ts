import { ccc } from "@ckb-ccc/core";

async function main() {
  const dummyClient = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114" });
  const myScripts = { ...dummyClient.scripts };
  
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

  myScripts[ccc.KnownScript.XUdt] = {
    cellDeps: [{
      cellDep: {
        outPoint: {
          txHash: "0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7",
          index: 6n,
        },
        depType: "code",
      }
    }],
    codeHash: "0x1a1e4fef34f5982906f745b048fe7b1089647e82346074e0f32c2ece26cf6b1e",
    hashType: "type",
  };

  const client = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114", scripts: myScripts });
  const signer = new ccc.SignerCkbPrivateKey(client, "0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6");
  const addressObj = await signer.getRecommendedAddressObj();

  const tokenAmount = 1000000n;
  const dataHex = ccc.numLeToBytes(tokenAmount, 16);

  const ownerLockHash = ccc.hashCkb(ccc.Script.encode(addressObj.script));
  
  const xudtTypeScript = await ccc.Script.fromKnownScript(client, ccc.KnownScript.XUdt, ccc.hexFrom(ownerLockHash));

  const xudtScriptInfo = await client.getKnownScript(ccc.KnownScript.XUdt);

  const tx = ccc.Transaction.from({
    outputs: [{ lock: addressObj.script, type: xudtTypeScript, capacity: 0n }],
    outputsData: [ccc.hexFrom(dataHex)],
    cellDeps: xudtScriptInfo.cellDeps.map((d) => d.cellDep),
  });

  tx.outputs[0].capacity = BigInt(tx.outputs[0].occupiedSize + dataHex.length) * 100000000n;

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000n);

  const txHash = await signer.sendTransaction(tx);
  console.log("Success! Hash:", txHash);
}
main().catch(console.error);

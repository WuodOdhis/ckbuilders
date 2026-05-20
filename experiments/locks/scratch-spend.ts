import { ccc } from "@ckb-ccc/core";

const DEPLOYED_TX_HASH = "0x3838fc9b70d49c54cee212ecec9d5f3d0c79135d1dcf6a50673fb81095763791";
const SCRIPT_CODE_HASH = "0xda460582613e42be8de68da386228e41cf3063c67cdbf1aeaafd0348a519ce73";

async function main() {
  const dummyClient = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114" });
  const myScripts = { ...dummyClient.scripts };
  myScripts[ccc.KnownScript.Secp256k1Blake160] = {
    cellDeps: [{ cellDep: { outPoint: { txHash: "0x4d804f1495612631da202fe9902fa9899118554b08138cfe5dfb50e1ede76293", index: 0n }, depType: "depGroup" } }],
    codeHash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8", hashType: "type",
  };
  const client = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114", scripts: myScripts });
  const signer = new ccc.SignerCkbPrivateKey(client, "0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6");
  const addressObj = await signer.getRecommendedAddressObj();

  // Try with data1
  const customLock = ccc.Script.from({ codeHash: SCRIPT_CODE_HASH, hashType: "data1", args: "0x" });
  const customAddress = await ccc.Address.fromScript(customLock, client);

  const txFund = ccc.Transaction.from({
    outputs: [{ lock: customLock, capacity: ccc.fixedPointFrom(100) }],
    outputsData: ["0x"],
  });
  await txFund.completeInputsByCapacity(signer);
  await txFund.completeFeeBy(signer, 1000n);
  const fundTxHash = await signer.sendTransaction(txFund);
  await new Promise(r => setTimeout(r, 2000));

  const txSpend = ccc.Transaction.from({
    inputs: [{ previousOutput: { txHash: fundTxHash, index: 0n } }],
    outputs: [{ lock: addressObj.script, capacity: ccc.fixedPointFrom(100) - 100000n }],
    outputsData: ["0x"],
    cellDeps: [{ outPoint: { txHash: DEPLOYED_TX_HASH, index: 0n }, depType: "code" }],
  });
  const spendTxHash = await client.sendTransaction(txSpend);
  console.log("Success with data1:", spendTxHash);
}
main().catch(console.error);

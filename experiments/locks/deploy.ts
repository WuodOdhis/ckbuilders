import { ccc } from "@ckb-ccc/core";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const dummyClient = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114" });
  const myScripts = { ...dummyClient.scripts };
  
  // Use offckb's system script outpoint for secp256k1
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
  
  // Funding account (first pre-funded offckb account)
  const signer = new ccc.SignerCkbPrivateKey(client, "0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6");
  const addressObj = await signer.getRecommendedAddressObj();

  console.log("Using deployer address:", addressObj.toString());

  // Read RISC-V binary
  const binaryPath = path.resolve(__dirname, "../../ckb-scripts/always-success/build/release/always-success");
  if (!fs.existsSync(binaryPath)) {
    throw new Error(`Compiled always-success binary not found at ${binaryPath}. Did you build it?`);
  }
  const binaryBuffer = fs.readFileSync(binaryPath);
  const dataHex = ccc.hexFrom(binaryBuffer);

  console.log("Binary size:", binaryBuffer.length, "bytes");

  // Build deployment transaction (placing binary into the output cell's data)
  const tx = ccc.Transaction.from({
    outputs: [{ lock: addressObj.script, capacity: 0n }],
    outputsData: [dataHex],
  });

  // Calculate required capacity for the cell (1 CKB per byte + cell structure overhead)
  const occupied = BigInt(tx.outputs[0].occupiedSize);
  const binaryLen = BigInt(binaryBuffer.length);
  tx.outputs[0].capacity = (occupied + binaryLen) * 100000000n;
  console.log("Calculated deployment cell capacity:", Number(tx.outputs[0].capacity / 100000000n), "CKB");

  console.log("Completing inputs...");
  await tx.completeInputsByCapacity(signer);
  console.log("Completing fee...");
  await tx.completeFeeBy(signer, 1000n);

  console.log("Sending deployment transaction...");
  const txHash = await signer.sendTransaction(tx);
  console.log("\nSuccess! Deployment transaction sent.");
  
  // Compute code hash of the binary using blake2b
  const codeHash = ccc.hashCkb(binaryBuffer);
  console.log("\n--- DEPLOYED SCRIPT METADATA ---");
  console.log("code_hash:", codeHash);
  console.log("hash_type: data");
  console.log("out_point.tx_hash:", txHash);
  console.log("out_point.index: 0");
  console.log("--------------------------------\n");
}

main().catch(console.error);

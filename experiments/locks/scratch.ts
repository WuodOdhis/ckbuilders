import { ccc } from "@ckb-ccc/core";
async function main() {
  const client = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114" });
  const script = ccc.Script.from({ codeHash: "0xda460582613e42be8de68da386228e41cf3063c67cdbf1aeaafd0348a519ce73", hashType: "data", args: "0x" });
  const addr = await ccc.Address.fromScript(script, client);
  console.log(addr.toString());
}
main();

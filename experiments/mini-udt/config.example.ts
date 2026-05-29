import { ccc } from "@ckb-ccc/core";

export function createDevnetClient() {
  const DEVNET_URL = "http://127.0.0.1:8114";
  const dummyClient = new ccc.ClientPublicTestnet({ url: DEVNET_URL });
  const myScripts = { ...dummyClient.scripts };

  myScripts[ccc.KnownScript.Secp256k1Blake160] = {
    cellDeps: [{
      cellDep: {
        outPoint: {
          txHash: "0x...",
          index: 0n,
        },
        depType: "depGroup" as const,
      },
    }],
    codeHash: "0x...",
    hashType: "type",
  };

  return new ccc.ClientPublicTestnet({ url: DEVNET_URL, scripts: myScripts });
}

export const ACCOUNTS = {
  primary: "0xYOUR_PRIVATE_KEY",
};

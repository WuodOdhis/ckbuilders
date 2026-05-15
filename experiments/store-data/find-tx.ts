import { ccc } from "@ckb-ccc/core";

async function main() {
  const client = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114" });
  
  // Account #0 Address
  const address = "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqvwg2cen8extgq8s5puft8vf40px3f599cytcyd8";
  const script = (await ccc.Address.fromString(address, client)).script;

  console.log("Searching for transactions for:", address);

  // Search for the last 5 transactions
  const transactions = client.findTransactions({
    searchKey: { script, scriptType: "lock" },
    order: "desc",
    limit: 5
  });

  for await (const tx of transactions) {
    console.log(`- Hash: ${tx.transactionHash}`);
  }
}

main().catch(console.error);

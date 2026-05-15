import React, { useEffect, useState } from 'react';
import { ccc } from '@ckb-ccc/connector-react';

// --- CONFIGURATION ---
const DEVNET_SCRIPTS = {
  [ccc.KnownScript.Secp256k1Blake160]: {
    cellDeps: [{ cellDep: { outPoint: { txHash: "0x4d804f1495612631da202fe9902fa9899118554b08138cfe5dfb50e1ede76293", index: 0n }, depType: "depGroup" as const } }],
    codeHash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8", hashType: "type" as const,
  },
  [ccc.KnownScript.XUdt]: {
    cellDeps: [{ cellDep: { outPoint: { txHash: "0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7", index: 6n }, depType: "code" as const } }],
    codeHash: "0x1a1e4fef34f5982906f745b048fe7b1089647e82346074e0f32c2ece26cf6b1e", hashType: "type" as const,
  },
  // Spore (DOB) Script for the devnet
  [ccc.KnownScript.Spore]: {
    cellDeps: [{ cellDep: { outPoint: { txHash: "0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7", index: 10n }, depType: "code" as const } }],
    codeHash: "0x7e8bf78a62232caa2f5d47e691e8db1a90d05e93dc6828ad3cb935c01ec6d208", hashType: "data2" as const,
  }
};

function App() {
  const { wallet, open, disconnect } = ccc.useCcc();
  const signer = ccc.useSigner();
  
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  
  // Form States
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [dobContent, setDobContent] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);
  const [privateKey, setPrivateKey] = useState<string>('');

  useEffect(() => {
    if (signer) {
      const client = new ccc.ClientPublicTestnet({ 
        url: "http://127.0.0.1:8114", 
        scripts: DEVNET_SCRIPTS 
      });
      signer.getRecommendedAddress().then(setAddress);
      signer.getBalance().then((bal) => {
        setBalance((Number(bal) / 10 ** 8).toFixed(2));
      });
      fetchTokenBalance(signer, client);
    } else {
      setAddress('');
      setBalance('0');
      setTokenBalance('0');
    }
  }, [signer]);

  const handleDevLogin = async () => {
    if (!privateKey.startsWith('0x')) {
      alert("Please enter a valid Private Key starting with 0x");
      return;
    }
    try {
      const client = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114", scripts: DEVNET_SCRIPTS });
      const devSigner = new ccc.SignerCkbPrivateKey(client, privateKey);
      // We manually set the signer in the app state if we were using a custom provider, 
      // but here we can just use the devSigner directly for transactions.
      // For the UI to update, we'll trigger a refresh.
      const addr = await devSigner.getRecommendedAddress();
      setAddress(addr);
      const bal = await devSigner.getBalance();
      setBalance((Number(bal) / 10 ** 8).toFixed(2));
      fetchTokenBalance(devSigner, client);
      alert("Connected via Private Key!");
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    }
  };

  const fetchTokenBalance = async (currentSigner: any, client: any) => {
    try {
      const addressObj = await currentSigner.getRecommendedAddressObj();
      const ownerLockHash = ccc.hashCkb(ccc.Script.encode(addressObj.script));
      const xudtTypeScript = await ccc.Script.fromKnownScript(client, ccc.KnownScript.XUdt, ccc.hexFrom(ownerLockHash));
      let total = 0n;
      const collector = client.findCells({ lock: addressObj.script, type: xudtTypeScript });
      for await (const cell of collector) {
        total += ccc.numFromLe(cell.outputData.slice(0, 34));
      }
      setTokenBalance(total.toString());
    } catch (err) { console.error(err); }
  };

  const getActiveSigner = async () => {
    if (privateKey) {
      const client = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114", scripts: DEVNET_SCRIPTS });
      return new ccc.SignerCkbPrivateKey(client, privateKey);
    }
    return signer;
  };

  const handleMintSpore = async () => {
    const activeSigner = await getActiveSigner();
    if (!activeSigner || !dobContent) return;
    setIsPending(true);
    try {
      const client = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114", scripts: DEVNET_SCRIPTS });
      const addressObj = await activeSigner.getRecommendedAddressObj();
      
      // Use the browser's native crypto API since ccc.randomBytes is not available
      const randomId = crypto.getRandomValues(new Uint8Array(32));
      const sporeId = ccc.hexFrom(randomId);
      const sporeTypeScript = await ccc.Script.fromKnownScript(client, ccc.KnownScript.Spore, sporeId);
      const contentType = "text/plain";
      const contentBytes = ccc.bytesFrom(dobContent, "utf8");
      const data = ccc.bytesConcat(ccc.bytesFrom(contentType, "utf8"), contentBytes);

      const tx = ccc.Transaction.from({
        outputs: [{ lock: addressObj.script, type: sporeTypeScript, capacity: 0n }],
        outputsData: [ccc.hexFrom(data)],
        cellDeps: [DEVNET_SCRIPTS[ccc.KnownScript.Spore].cellDeps[0].cellDep],
      });

      await tx.completeInputsByCapacity(activeSigner);
      await tx.completeFeeBy(activeSigner, 1000n);
      const txHash = await activeSigner.sendTransaction(tx);
      alert(`DOB Minted! Hash: ${txHash}`);
    } catch (err: any) { alert(`Mint Failed: ${err.message}`); } finally { setIsPending(false); }
  };

  const handleTransfer = async () => {
    const activeSigner = await getActiveSigner();
    if (!activeSigner || !recipientAddress || !transferAmount) return;
    setIsPending(true);
    try {
      const client = new ccc.ClientPublicTestnet({ url: "http://127.0.0.1:8114", scripts: DEVNET_SCRIPTS });
      const addressObj = await activeSigner.getRecommendedAddressObj();
      const receiverAddrObj = await ccc.Address.fromString(recipientAddress, client);
      const ownerLockHash = ccc.hashCkb(ccc.Script.encode(addressObj.script));
      const xudtTypeScript = await ccc.Script.fromKnownScript(client, ccc.KnownScript.XUdt, ccc.hexFrom(ownerLockHash));
      const tx = ccc.Transaction.from({
        outputs: [{ lock: receiverAddrObj.script, type: xudtTypeScript, capacity: 0n }],
        outputsData: [ccc.hexFrom(ccc.numLeToBytes(BigInt(transferAmount), 16))],
        cellDeps: [DEVNET_SCRIPTS[ccc.KnownScript.XUdt].cellDeps[0].cellDep],
      });
      await tx.completeInputsByUdt(activeSigner, xudtTypeScript);
      await tx.completeInputsByCapacity(activeSigner);
      await tx.completeFeeBy(activeSigner, 1000n);
      const txHash = await activeSigner.sendTransaction(tx);
      alert(`Transfer Successful! Hash: ${txHash}`);
      fetchTokenBalance(activeSigner, client);
    } catch (err: any) { alert(`Transfer Failed: ${err.message}`); } finally { setIsPending(false); }
  };

  return (
    <div className="app-container">
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>
      <main className="glass-card">
        <header>
          <h1>CKB Asset Factory</h1>
          <p className="subtitle">Mint DOBs and Transfer Tokens.</p>
        </header>

        <div className="wallet-section">
          {!wallet && !address ? (
            <div className="connect-prompt">
              <button className="primary-btn" onClick={open}>Connect with JoyID</button>
              <div className="dev-separator">OR</div>
              <div className="dev-login">
                <input 
                  type="password" 
                  placeholder="Enter Private Key (0x...)" 
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
                <button className="secondary-btn" onClick={handleDevLogin}>Developer Login</button>
              </div>
            </div>
          ) : (
            <div className="wallet-info">
              <div className="address-display">
                <label>Connected Address</label>
                <code>{address}</code>
              </div>
              
              <div className="stats-grid">
                <div className="stat-item">
                  <label>CKB Balance</label>
                  <div className="val">{balance} <small>CKB</small></div>
                </div>
                <div className="stat-item">
                  <label>xUDT Balance</label>
                  <div className="val">{tokenBalance} <small>TOKENS</small></div>
                </div>
              </div>

              <div className="action-tabs">
                <div className="transfer-form">
                  <h3>Mint Digital Object (DOB)</h3>
                  <input 
                    type="text" 
                    placeholder="DOB Content (e.g. Hello Spore!)" 
                    value={dobContent}
                    onChange={(e) => setDobContent(e.target.value)}
                  />
                  <button className="primary-btn" onClick={handleMintSpore} disabled={isPending}>
                    {isPending ? 'Minting...' : 'Mint Spore'}
                  </button>
                </div>

                <div className="transfer-form">
                  <h3>Transfer Tokens</h3>
                  <div className="input-group">
                    <input type="text" placeholder="Recipient" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)}/>
                    <input type="number" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)}/>
                  </div>
                  <button className="primary-btn" onClick={handleTransfer} disabled={isPending}>
                    {isPending ? 'Sending...' : 'Send Tokens'}
                  </button>
                </div>
              </div>
              <button className="secondary-btn" onClick={disconnect}>Disconnect</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { ccc } from '@ckb-ccc/connector-react';

function App() {
  const { wallet, open, disconnect } = ccc.useCcc();
  const signer = ccc.useSigner();
  
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    if (signer) {
      // Get the address from the signer
      signer.getRecommendedAddress().then((addr) => {
        setAddress(addr);
      });
      // Get the CKB balance from the signer
      signer.getBalance().then((bal) => {
        // Balance is returned in Shannons (1 CKB = 10^8 Shannons)
        // We divide by 10^8 to display CKB, formatted to 2 decimal places
        const ckbBalance = Number(bal) / 10 ** 8;
        setBalance(ckbBalance.toFixed(2));
      });
    } else {
      setAddress('');
      setBalance('0');
    }
  }, [signer]);

  return (
    <div className="app-container">
      {/* Background decoration */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>
      
      <main className="glass-card">
        <header>
          <h1>CKB Simple dApp</h1>
          <p className="subtitle">Connect your wallet to view on-chain state.</p>
        </header>

        <div className="wallet-section">
          {!wallet ? (
            <div className="connect-prompt">
              <p>You are not connected.</p>
              <button className="primary-btn" onClick={open}>
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="wallet-info">
              <div className="info-header">
                <span className="status-indicator online"></span>
                <h3>Connected via {wallet.name}</h3>
              </div>
              
              <div className="info-group">
                <label>Testnet Address</label>
                <div className="mono-text address-box">
                  {address || 'Loading...'}
                </div>
              </div>

              <div className="info-group">
                <label>Available Balance</label>
                <div className="balance-display">
                  <span className="amount">{balance}</span>
                  <span className="currency">CKB</span>
                </div>
              </div>

              <button className="secondary-btn" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

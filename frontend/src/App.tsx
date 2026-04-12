import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Header } from "./components/Header";
import VotingPanel from "./components/VotingPanel";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setIsConnected(true);
          setWalletAddress(accounts[0]);
        }
      }
    };
    checkConnection();
  }, []);

  const handleConnect = (address: string) => {
    setIsConnected(true);
    setWalletAddress(address);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Header 
        isConnected={isConnected} 
        walletAddress={walletAddress} 
        onConnect={handleConnect} 
        onDisconnect={handleDisconnect} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-12">
         <VotingPanel />
      </main>

      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
          <p className="font-bold">DeCred © 2026 - Secure Decentralized Voting</p>
          <p className="text-xs opacity-60">Built with Vite, Ethers & Scaffold-ETH Aesthetics</p>
        </div>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;

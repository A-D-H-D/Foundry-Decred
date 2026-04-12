import React from "react";
import { Vote, Menu } from "lucide-react";
import { Address } from "./scaffold-eth/Address";
import { Balance } from "./scaffold-eth/Balance";
import { ThemeSwitcher } from "./scaffold-eth/ThemeSwitcher";

interface HeaderProps {
  isConnected: boolean;
  walletAddress: string;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isConnected, 
  walletAddress, 
  onConnect, 
  onDisconnect 
}) => {
  const handleConnect = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      onConnect(accounts[0]);
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  return (
    <div className="navbar bg-base-100 sticky top-0 z-20 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown">
          <label tabIndex={0} className="btn btn-ghost">
            <Menu className="h-5 w-5" />
          </label>
          <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
             <li><a href="/" className="font-bold">Home</a></li>
          </ul>
        </div>
        <div className="flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex -mt-0.5">
             <div className="p-1 bg-primary rounded-lg">
                <Vote className="w-6 h-6 text-primary-content" />
             </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight text-xl">DeCred</span>
            <span className="text-[0.65rem] opacity-70 tracking-tighter">Decentralized Voting</span>
          </div>
        </div>
      </div>

      <div className="navbar-end flex-grow mr-4 gap-2">
        <ThemeSwitcher />
        {isConnected ? (
          <div className="flex items-center gap-4 bg-secondary/30 rounded-full pl-4 pr-1 py-1 border border-secondary">
            <Balance address={walletAddress} className="mr-2" />
            <div className="flex items-center bg-base-100 rounded-full px-3 py-1.5 shadow-sm">
                <Address address={walletAddress} />
                <button 
                  onClick={onDisconnect}
                  className="ml-3 btn btn-ghost btn-xs text-error hover:bg-error/10"
                >
                  Disconnect
                </button>
            </div>
          </div>
        ) : (
          <button 
            className="btn btn-primary btn-sm rounded-full px-6 font-bold" 
            onClick={handleConnect}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

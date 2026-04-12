import { useState, useEffect } from "react";
import { BrowserProvider, formatEther } from "ethers";

interface BalanceProps {
  address?: string;
  className?: string;
}

export const Balance = ({ address, className = "" }: BalanceProps) => {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !window.ethereum) return;

    const fetchBalance = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const rawBalance = await provider.getBalance(address);
        setBalance(formatEther(rawBalance));
      } catch (e) {
        console.error("Error fetching balance:", e);
      }
    };

    fetchBalance();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [address]);

  if (!address) return null;

  return (
    <div className={`flex items-center gap-1 font-medium ${className}`}>
      {balance ? (
        <>
          <span className="text-sm">{Number(balance).toFixed(4)}</span>
          <span className="text-xs text-primary font-bold">ETH</span>
        </>
      ) : (
        <div className="animate-pulse bg-slate-800 h-4 w-16 rounded"></div>
      )}
    </div>
  );
};

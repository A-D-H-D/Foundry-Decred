import { useState } from "react";
import Blockies from "react-blockies";
import { CheckCircle, Copy } from "lucide-react";

interface AddressProps {
  address?: string;
  size?: "sm" | "base" | "lg";
  disableAddressLink?: boolean;
  format?: "short" | "long";
}

export const Address = ({ address, size = "base", format = "short" }: AddressProps) => {
  const [addressCopied, setAddressCopied] = useState(false);

  if (!address) {
    return (
      <div className="animate-pulse bg-slate-800 h-6 w-32 rounded"></div>
    );
  }

  const displayAddress = format === "short" 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 800);
  };

  const iconSize = size === "sm" ? 16 : size === "base" ? 24 : 32;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        <Blockies seed={address.toLowerCase()} size={8} scale={iconSize / 8} className="rounded-full" />
      </div>
      
      <span className={`font-mono ${size === "sm" ? "text-xs" : "text-sm"} font-medium`}>
        {displayAddress}
      </span>

      <button
        onClick={copyToClipboard}
        className="ml-1 text-primary hover:text-primary-focus transition-colors"
      >
        {addressCopied ? (
          <CheckCircle className="w-4 h-4 text-success" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

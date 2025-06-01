import React from 'react';
import { useSiwe } from '../providers/siwe-provider';
import { Button } from '@docu/ui/components/button';
import { Loader2, WalletIcon, LogOut } from 'lucide-react';

interface WalletConnectorProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, onDisconnect, className = '' }) => {
  const { address, isConnecting, isConnected, error, connectWallet, disconnectWallet } = useSiwe();

  const handleConnect = async () => {
    await connectWallet();
    onConnect?.();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onDisconnect?.();
  };

  // Format the address for display: 0x1234...5678
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isConnected && address) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
          <span>{formatAddress(address)}</span>
        </div>
        <Button onClick={handleDisconnect} variant="outline" size="sm" className="flex items-center gap-1">
          <LogOut size={16} />
          <span>Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting} className={`flex items-center gap-2 ${className}`}>
      {isConnecting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <WalletIcon size={16} />
          <span>Connect Wallet</span>
        </>
      )}
    </Button>
  );
};

export default WalletConnector;

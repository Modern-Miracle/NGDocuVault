import React from 'react';
import { Bell, Search, Menu as MenuIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import UserImage from '../assets/avatar/user.png';
import { useAccount, useBalance } from 'wagmi';
import { GetBalanceData } from 'wagmi/query';
import { formatBalance } from '@/utils/helpers';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const shortenAddress = (address: `0x${string}` | undefined) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 3)}`;
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm bg-background/95 shadow-xs">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            title="Toggle sidebar"
            type="button"
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
            onClick={toggleSidebar}
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="hidden lg:flex lg:items-center lg:w-64 lg:h-full">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm text-foreground bg-background rounded-lg border border-input focus:ring-primary focus:border-primary"
                placeholder="Search documents..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            title="Notifications"
            variant="ghost"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-1">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">{shortenAddress(address)}</span>
              <span className="text-xs text-muted-foreground">
                {formatBalance(balance as GetBalanceData)} {balance?.symbol}
              </span>
            </div>

            <Avatar className="h-9 w-9 border p-1">
              <AvatarImage src={UserImage} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

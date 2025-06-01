import { Button } from '@docu/ui/components/button';
import { WalletButton } from '@rainbow-me/rainbowkit';

interface CustomWalletConnectProps {
  leftIcon: React.ReactNode;
  label: string;
  className?: string;
  rightIcon?: React.ReactNode;
}

const CustomWalletConnect = ({ leftIcon, label, className, rightIcon }: CustomWalletConnectProps) => {
  return (
    <WalletButton.Custom wallet="metamask">
      {({ ready, connect }) => {
        return (
          <Button type="button" variant="outline" disabled={!ready} onClick={connect} className={className}>
            {leftIcon}
            <span>{label}</span>
            {rightIcon}
          </Button>
        );
      }}
    </WalletButton.Custom>
  );
};

export default CustomWalletConnect;

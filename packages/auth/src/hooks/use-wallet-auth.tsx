import { useContext } from 'react';
import { WalletAuthContext } from '../context/wallet-auth-context';

export const useWalletAuth = () => useContext(WalletAuthContext);

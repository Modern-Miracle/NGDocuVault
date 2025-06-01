'use client';

import { Hex } from 'viem';
import { useWalletClient } from 'wagmi';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useSignData = () => {
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();

  // Always call useMutation regardless of wallet state
  return useMutation({
    mutationKey: ['signData'],
    mutationFn: async (data: Hex | string) => {
      if (!walletClient) {
        toast.error('Wallet not connected');
        throw new Error('Wallet not connected');
      }
      return await walletClient.signMessage({ message: data });
    },
  });
};

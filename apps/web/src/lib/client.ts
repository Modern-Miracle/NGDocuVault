import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { env } from '@/config/env';

const rpcUrl = env.VITE_RPC_URL;

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(rpcUrl),
});

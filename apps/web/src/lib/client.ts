import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';

const rpcUrl = import.meta.env.VITE_RPC_URL!;

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(rpcUrl),
});

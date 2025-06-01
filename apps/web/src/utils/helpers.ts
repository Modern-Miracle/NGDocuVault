import { formatEther } from "viem";
import { GetBalanceData } from "wagmi/query";

export const formatBalance = (balance: GetBalanceData) => {
  if (!balance?.value) return "0.00";
  const formattedBalance = formatEther(balance.value);
  return Number(formattedBalance).toFixed(4);
};

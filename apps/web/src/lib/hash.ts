import { HashingService } from '@/services/HashingService';

export async function hashData(data: Record<string, unknown>) {
  const hashingService = new HashingService();
  const hash = await hashingService.hashData(JSON.stringify(data));
  // Convert to 0x prefixed hex string for Ethereum compatibility
  return `0x${hash}` as `0x${string}`;
}
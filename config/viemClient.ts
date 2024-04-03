import { createPublicClient, http } from 'viem';
import { isDev } from './common';
import { holesky, mainnet } from 'viem/chains';

export const viemPublicClient = createPublicClient({
  chain: isDev() ? holesky : mainnet,
  transport: http(),
});

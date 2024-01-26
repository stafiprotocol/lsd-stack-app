import { holesky, mainnet } from 'viem/chains';
import { createConfig, http } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [holesky, mainnet],
  connectors: [injected()],
  transports: {
    [holesky.id]: http(),
    [mainnet.id]: http(),
  },
});

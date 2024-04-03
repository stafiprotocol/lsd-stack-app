import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { createPublicClient, http } from 'viem';
import { configureChains, createConfig } from 'wagmi';
import { bsc, bscTestnet, goerli, mainnet } from 'wagmi/chains';
// import { LedgerConnector } from "wagmi/connectors/ledger";
import { SafeConnector } from 'wagmi/connectors/safe';
import { isDev } from './common';
// import { WalletConnectModal } from "@walletconnect/modal";

// 1. Get projectId
// export const walletConnectProjectId = "b4a5e478100e2abc546807e8fd74dd7f";
export const walletConnectProjectId = '49d39e856ab00fbe22d96b7a700a9739';
// 2. Configure wagmi client
const chains = [isDev() ? goerli : mainnet, isDev() ? bscTestnet : bsc];

const { publicClient } = configureChains(chains, [
  w3mProvider({ projectId: walletConnectProjectId }),
]);

export const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: [
    new SafeConnector({ chains }),
    // new LedgerConnector({
    //   chains,
    //   options: {
    //     enableDebugLogs: false,
    //     walletConnectVersion: 2,
    //     projectId: walletConnectProjectId,
    //     requiredChains: [1],
    //   },
    // }),
    ...w3mConnectors({
      // version: 2,
      chains,
      projectId: walletConnectProjectId,
    }),
  ],
  // connectors: [
  //   new WalletConnectConnector({
  //     chains: [goerli],
  //     options: {
  //       projectId: walletConnectProjectId,
  //     },
  //   }),
  // ],
  publicClient,
});

// 3. Configure modal ethereum client
export const ethereumClient = new EthereumClient(wagmiConfig, chains);

export const defaultEvmChain = isDev() ? goerli : mainnet;
export const defaultBscChain = isDev() ? bscTestnet : bsc;

export const ethViemClient = createPublicClient({
  chain: defaultEvmChain,
  transport: http(),
});

export const bscViemClient = createPublicClient({
  chain: defaultBscChain,
  transport: http(),
});

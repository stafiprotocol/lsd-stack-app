import { w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { configureChains, createConfig } from 'wagmi';
// import { LedgerConnector } from "wagmi/connectors/ledger";
import { SafeConnector } from 'wagmi/connectors/safe';
import { getEvmWagmiChainConfigs, getWagmiChainConfig } from './eth/env';
// import { WalletConnectModal } from "@walletconnect/modal";

// 1. Get projectId
// export const walletConnectProjectId = "b4a5e478100e2abc546807e8fd74dd7f";
export const walletConnectProjectId = '49d39e856ab00fbe22d96b7a700a9739';
// 2. Configure wagmi client
const chains = [
  ...getEvmWagmiChainConfigs(),
  getWagmiChainConfig(),
  // getSeiWagmiChainConfig(),
];

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

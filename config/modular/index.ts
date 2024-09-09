import { AppEco, ModuleType } from 'interfaces/common';

export const modularConfigs = {
  externalModules: [
    {
      type: ModuleType.Ccip,
      title: 'Chainlink CCIP',
      description:
        'By seamlessly integrating Chainlink&lsquo;s robust and secure CCIP functions, this module empowers developers to build and operate dApps with cross-chain capabilities.',
      externalLink: 'https://chain.link/cross-chain',
      tutorialLink:
        'https://lsaas-docs.stafi.io/docs/modules/ccip_modules.html',
    },
    {
      type: ModuleType.Blinks,
      title: 'Blinks',
      description:
        'With Solana Actions and blockchain links, or blinks, transactions can open up to anywhere on the internet — no dApp required.',
      externalLink: 'https://solana.com/solutions/actions',
      tutorialLink:
        'https://lsaas-docs.stafi.io/docs/modules/blinks_module.html',
    },
    {
      type: ModuleType.Connext,
      title: 'Connext',
      description:
        'Connext protocol allows users to bridge funds and developers to build asynchronous Solidity for the first time!',
      externalLink: 'https://www.connext.network/',
      tutorialLink:
        'https://lsaas-docs.stafi.io/docs/modules/l2_native_restaking_module.html',
    },
  ],
  supportList: {
    [AppEco.Eth]: [
      ModuleType.PointSystem,
      ModuleType.Frontend,
      ModuleType.Ccip,
      ModuleType.Connext,
    ],
    [AppEco.Evm]: [ModuleType.PointSystem, ModuleType.Frontend],
    [AppEco.Lrt]: [
      ModuleType.PointSystem,
      ModuleType.Frontend,
      ModuleType.Connext,
    ],
    [AppEco.Cosmos]: [ModuleType.Ai, ModuleType.Frontend],
    [AppEco.Sol]: [ModuleType.Frontend, ModuleType.Blinks],
    [AppEco.Polkadot]: [ModuleType.Frontend],
    [AppEco.Others]: [ModuleType.Frontend],
  },
};

import { AppEco, ModuleType } from 'interfaces/common';

export const modularConfigs = {
  externalModules: [
    {
      type: ModuleType.Ccip,
      title: 'Chainlink CCIP',
      description:
        "By seamlessly integrating Chainlink's robust and secure CCIP functions, this module empowers developers to build and operate dApps with cross-chain capabilities.",
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
      tutorialLink: 'https://docs.stafi.io/lsaas/modules/blinks_module/',
    },
    {
      type: ModuleType.Connext,
      title: 'Connext',
      description:
        'Connext protocol allows users to bridge funds and developers to build asynchronous Solidity for the first time!',
      externalLink: 'https://www.connext.network/',
      tutorialLink: 'https://docs.stafi.io/lsaas/modules/l2_restaking_module/',
    },
    {
      type: ModuleType.ZkMe,
      title: 'ZkMe zkKYC',
      description:
        "By leveraging ZKMe's zkKYC module, users benefit from seamless privacy protection, ensuring a trusted liquid staking experience while maintaining user anonymity and ecosystem integrity.",
      externalLink:
        'https://docs.zk.me/zkme-dochub/verify-with-zkme-protocol/integration-checklist',
      tutorialLink:
        'https://docs.zk.me/zkme-dochub/verify-with-zkme-protocol/integration-checklist',
    },
    {
      type: ModuleType.OpenOcean,
      title: 'OpenOcean Swap',
      description:
        "OpenOcean's Swap Module empowers StaFi LSaaS users with an aggregated, efficient, and cost-effective trading and bridging experience. ",
      externalLink: 'https://apis.openocean.finance',
      tutorialLink: 'https://apis.openocean.finance',
    },
  ],
  supportList: {
    [AppEco.Eth]: [
      ModuleType.PointSystem,
      ModuleType.Frontend,
      ModuleType.Ccip,
      ModuleType.Connext,
      ModuleType.ZkMe,
      ModuleType.OpenOcean,
    ],
    [AppEco.Evm]: [
      ModuleType.PointSystem,
      ModuleType.Frontend,
      ModuleType.OpenOcean,
    ],
    [AppEco.Lrt]: [
      ModuleType.PointSystem,
      ModuleType.Frontend,
      ModuleType.Connext,
      ModuleType.OpenOcean,
    ],
    [AppEco.Cosmos]: [ModuleType.Ai, ModuleType.Frontend],
    [AppEco.Sol]: [
      ModuleType.Frontend,
      ModuleType.Blinks,
      ModuleType.OpenOcean,
    ],
    [AppEco.Polkadot]: [ModuleType.Frontend],
    [AppEco.Others]: [ModuleType.Frontend],
    [AppEco.Ton]: [ModuleType.Frontend],
    [AppEco.Ulst]: [ModuleType.Frontend],
  },
};

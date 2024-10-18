import { AddEthereumChainParameter } from '@web3-react/types';
import { isDev } from 'config/common';
import { evmLsdTokens } from 'config/evm';
import { getEtherScanUrl } from 'config/explorer';

export function getEthereumChainId() {
  if (isDev()) {
    return 17000;
  }
  return 1;
}

export function getEthereumChainName() {
  if (isDev()) {
    return 'Holesky';
  }
  return 'Ethereum';
}

export function getEthereumRpc() {
  if (isDev()) {
    return 'https://ethereum-holesky.publicnode.com';
  }
  return 'https://mainnet.infura.io/v3/b3611f564322439ab2491e04ddd55b39';
}

export function getWagmiChainConfig() {
  return {
    id: getEthereumChainId(),
    name: getEthereumChainName(),
    network: getEthereumChainName(),
    nativeCurrency: {
      decimals: 18,
      name: 'ETH',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [getEthereumRpc()],
      },
      public: {
        http: [getEthereumRpc()],
      },
    },
    blockExplorers: {
      etherscan: {
        name: '',
        url: getEtherScanUrl(),
      },
      default: {
        name: '',
        url: getEtherScanUrl(),
      },
    },
    contracts: {},
    testnet: isDev(),
  };
}

export function getSeiWagmiChainConfig() {
  const seiConfig =
    evmLsdTokens.find((item) => item.symbol === 'SEI') || evmLsdTokens[0];

  return {
    id: seiConfig.chainId,
    name: seiConfig.chainName,
    network: seiConfig.chainName,
    nativeCurrency: {
      decimals: 18,
      name: 'SEI',
      symbol: 'SEI',
    },
    rpcUrls: {
      default: {
        http: [seiConfig.rpc],
      },
      public: {
        http: [seiConfig.rpc],
      },
    },
    blockExplorers: {
      etherscan: {
        name: '',
        url: seiConfig.explorerUrl,
      },
      default: {
        name: '',
        url: seiConfig.explorerUrl,
      },
    },
    contracts: {},
    testnet: isDev(),
  };
}

export function getEvmWagmiChainConfigs() {
  return evmLsdTokens.map((lsdToken) => ({
    id: lsdToken.chainId,
    name: lsdToken.chainName,
    network: lsdToken.chainName,
    nativeCurrency: {
      decimals: 18,
      name: lsdToken.symbol,
      symbol: lsdToken.symbol,
    },
    rpcUrls: {
      default: {
        http: [lsdToken.rpc],
      },
      public: {
        http: [lsdToken.rpc],
      },
    },
    blockExplorers: {
      etherscan: {
        name: '',
        url: lsdToken.explorerUrl,
      },
      default: {
        name: '',
        url: lsdToken.explorerUrl,
      },
    },
    contracts: {},
    testnet: isDev(),
  }));
}

export function getCosmosStackAppUrl() {
  return 'https://test-neutron-lsd.stafi.io/';
}

export function getEthStackAppUrl() {
  return 'https://test-eth-lsd.stafi.io';
}

export function getLrtCaseUrl() {
  return 'https://docs.stafi.io/lsaas/architecture_el_lrt/';
}

export function getEvmCaseUrl() {
  return 'https://docs.stafi.io/lsaas/architecture_evm_lsd/';
}

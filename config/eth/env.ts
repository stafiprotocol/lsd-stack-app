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

export function getCosmosStackAppUrl() {
  return 'https://test-neutron-lsd.stafi.io/';
}

export function getEthStackAppUrl() {
  return 'https://test-eth-lsd.stafi.io';
}

export function getLrtCaseUrl() {
  return 'https://lsaas-docs.stafi.io/docs/architecture/el_lrt.html';
}

export function getEvmCaseUrl() {
  return 'https://lsaas-docs.stafi.io/docs/architecture/evmlsd.html';
}

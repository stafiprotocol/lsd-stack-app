import { AddEthereumChainParameter } from '@web3-react/types';
import { isDev } from 'config/common';
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

export function getCosmosStackAppUrl() {
  return 'https://test-neutron-lsd.stafi.io/';
}

export function getEthStackAppUrl() {
  return 'https://www.google.com';
}

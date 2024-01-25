import { AddEthereumChainParameter } from '@web3-react/types';

export function isDev() {
  return process.env.NEXT_PUBLIC_ENV !== 'production';
}

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

export function getEthereumChainInfo(): AddEthereumChainParameter {
  if (isDev()) {
    return {
      chainId: 17000,
      chainName: 'Holesky',
      nativeCurrency: {
        name: 'Holesky Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://ethereum-holesky.publicnode.com'],
      blockExplorerUrls: ['https://holesky.etherscan.io'],
    };
  } else {
    return {
      chainId: 1,
      chainName: 'Ethereum',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: [
        'https://mainnet.infura.io/v3/b3611f564322439ab2491e04ddd55b39',
      ],
      blockExplorerUrls: ['https://etherscan.io'],
    };
  }
}

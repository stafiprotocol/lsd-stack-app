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

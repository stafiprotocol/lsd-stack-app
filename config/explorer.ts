import { isDev } from './common';
import { cosmosExplorerUrl, neutronChainConfig } from './cosmos/chain';
import { evmLsdTokens } from './evm';

export function getEtherScanUrl() {
  if (isDev()) {
    return `https://holesky.etherscan.io`;
  }
  return `https://etherscan.io`;
}

export function getEtherScanTxUrl(txHash: string | undefined) {
  if (isDev()) {
    return `https://holesky.etherscan.io/tx/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`;
}

export function getEtherScanAccountUrl(account: string) {
  if (isDev()) {
    return `https://holesky.etherscan.io/address/${account}`;
  }
  return `https://etherscan.io/address/${account}`;
}

export function getEtherScanErc20TxUrl(address: any) {
  if (isDev()) {
    return `https://holesky.etherscan.io/address/${address}#tokentxns`;
  }
  return `https://etherscan.io/address/${address}#tokentxns`;
}

export function getEvmScanTxUrl(symbol: string, txHash: string | undefined) {
  if (symbol === 'SEI') {
    if (isDev()) {
      return `https://seitrace.com/tx/${txHash}?chain=atlantic-2`;
    }
    return `https://seitrace.com/tx/${txHash}?chain=pacific-1`;
  } else {
    const matchedToken =
      evmLsdTokens.find((item) => item.symbol === symbol) || evmLsdTokens[0];
    return `${matchedToken.explorerUrl}/tx/${txHash}`;
  }
}

export function getEvmScanAccountUrl(
  symbol: string,
  address: string | undefined
) {
  if (symbol === 'SEI') {
    if (isDev()) {
      return `https://seitrace.com/address/${address}?chain=atlantic-2`;
    }
    return `https://seitrace.com/address/${address}?chain=pacific-1`;
  } else {
    const matchedToken =
      evmLsdTokens.find((item) => item.symbol === symbol) || evmLsdTokens[0];
    return `${matchedToken.explorerUrl}/address/${address}`;
  }
}

export function getEvmScanValidatorUrl(
  symbol: string,
  address: string | undefined
) {
  if (symbol === 'SEI') {
    if (isDev()) {
      return `https://seitrace.com/validator/${address}?chain=atlantic-2`;
    }
    return `https://seitrace.com/validator/${address}?chain=pacific-1`;
  }

  return getEvmScanAccountUrl(symbol, address);
}

export function getNeutronExplorerUrl() {
  return neutronChainConfig.explorerUrl;
}

export function getNeutronExplorerTxUrl(
  txHash: string | undefined,
  chainId?: string
) {
  if (isDev()) {
    return `${getNeutronExplorerUrl()}/tx/${txHash}`;
  }
  return `${getNeutronExplorerUrl()}/tx/${txHash}`;
}

export function getNeutronExplorerAccountUrl(
  account: string,
  chainId?: string
) {
  if (isDev()) {
    return `${getNeutronExplorerUrl()}/accounts/${account}`;
  }
  return `${getNeutronExplorerUrl()}/accounts/${account}`;
}

export function getNeutronExplorerContractUrl(
  contractAddress: string,
  chainId?: string
) {
  if (isDev()) {
    return `${getNeutronExplorerUrl()}/contracts/${contractAddress}`;
  }
  return `${getNeutronExplorerUrl()}/contracts/${contractAddress}`;
}

export function getCosmosExplorerAccountUrl(account: string) {
  if (isDev()) {
    return `${cosmosExplorerUrl}/account/${account}`;
  }
  return `${cosmosExplorerUrl}/account/${account}`;
}

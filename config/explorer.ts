import { isDev } from './common';
import { neutronChainConfig } from './cosmos/chain';

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

export function getCosmosExplorerUrl() {
  return neutronChainConfig.explorerUrl;
}

export function getCosmosExplorerTxUrl(
  txHash: string | undefined,
  chainId?: string
) {
  if (isDev()) {
    return `${getCosmosExplorerUrl()}/tx/${txHash}`;
  }
  return `${getCosmosExplorerUrl()}/tx/${txHash}`;
}

export function getCosmosExplorerAccountUrl(account: string, chainId?: string) {
  if (isDev()) {
    return `${getCosmosExplorerUrl()}/accounts/${account}`;
  }
  return `${getCosmosExplorerUrl()}/accounts/${account}`;
}

export function getCosmosExplorerContractUrl(
  contractAddress: string,
  chainId?: string
) {
  if (isDev()) {
    return `${getCosmosExplorerUrl()}/contracts/${contractAddress}`;
  }
  return `${getCosmosExplorerUrl()}/contracts/${contractAddress}`;
}

export function getCosmosExplorerTokenTxUrl(address: any, chainId?: string) {
  if (isDev()) {
    return `${getCosmosExplorerUrl()}/address/${address}#tokentxns`;
  }
  return `${getCosmosExplorerUrl()}/address/${address}#tokentxns`;
}

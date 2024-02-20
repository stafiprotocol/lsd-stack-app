import { lsdTokenChainConfigs, neutronChainConfig } from "./cosmos/chain";
import { isDev } from "./env";

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

export function getCosmosExplorerUrl(chainId?: string) {
  if (chainId === neutronChainConfig.chainId || !chainId) {
    return neutronChainConfig.explorerUrl;
  }
  const matched = lsdTokenChainConfigs.find((item) => item.chainId === chainId);
  return matched?.explorerUrl;
}

export function getCosmosExplorerTxUrl(
  txHash: string | undefined,
  chainId?: string
) {
  if (isDev()) {
    return `${getCosmosExplorerUrl(chainId)}/tx/${txHash}`;
  }
  return `${getCosmosExplorerUrl(chainId)}/tx/${txHash}`;
}

export function getCosmosExplorerAccountUrl(account: string, chainId?: string) {
  if (isDev()) {
    return `${getCosmosExplorerUrl(chainId)}/address/${account}`;
  }
  return `${getCosmosExplorerUrl(chainId)}/address/${account}`;
}

export function getCosmosExplorerTokenTxUrl(address: any, chainId?: string) {
  if (isDev()) {
    return `${getCosmosExplorerUrl(chainId)}/address/${address}#tokentxns`;
  }
  return `${getCosmosExplorerUrl(chainId)}/address/${address}#tokentxns`;
}

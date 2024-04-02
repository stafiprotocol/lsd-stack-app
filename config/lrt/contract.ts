import { AbiItem } from 'web3-utils';
import factoryContractAbi from './abi/factory.json';
import lrtTokenContractAbi from './abi/lrtToken.json';
import lrtStakeManagerAbi from './abi/stakeManager.json';
import lrtStakePoolAbi from './abi/stakePool.json';
import devConfig from './dev.json';
import prodConfig from './prod.json';
import { isDev } from 'config/common';

/**
 * get factory contract info
 */

export function getLrtFactoryContract() {
  return {
    abi: factoryContractAbi as AbiItem[],
    address: isDev()
      ? devConfig.factoryContractAddress
      : (prodConfig.factoryContractAddress as `0x${string}`),
  };
}

/**
 * get lrt token contract ABI
 */
export function getLrtTokenContractAbi() {
  return lrtTokenContractAbi as AbiItem[];
}

/**
 * get lrt stake manager ABI
 */
export function getLrtStakeManagerAbi() {
  return lrtStakeManagerAbi as AbiItem[];
}

/**
 * get lrt stake pool ABI
 */
export function getLrtStakePoolAbi() {
  return lrtStakePoolAbi as AbiItem[];
}

import { isDev } from 'config/common';
import { EvmLsdTokenConfig } from 'interfaces/common';
import { AbiItem } from 'web3-utils';
import factoryAbi from './abi/factory.json';
import bnbFactoryAbi from './abi/bnbFactory.json';
import stakeManagerAbi from './abi/stakeManager.json';
import bnbStakeManagerAbi from './abi/bnbStakeManager.json';
import stakeHubAbi from './abi/stakeHub.json';
import devConfig from './dev.json';
import prodConfig from './prod.json';

export const evmLsdTokens: EvmLsdTokenConfig[] = isDev()
  ? devConfig.lsdTokens
  : prodConfig.lsdTokens;

export const getEvmFactoryAbi = (symbol?: string) => {
  if (symbol === 'BNB') {
    return bnbFactoryAbi as AbiItem[];
  }
  return factoryAbi as AbiItem[];
};

export const getEvmStakeManagerAbi = (symbol?: string) => {
  if (symbol === 'BNB') {
    return bnbStakeManagerAbi as AbiItem[];
  }
  return stakeManagerAbi as AbiItem[];
};

export const getStakeHubAbi = () => {
  return stakeHubAbi as AbiItem[];
};

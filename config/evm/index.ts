import { isDev } from 'config/common';
import { EvmLsdTokenConfig } from 'interfaces/common';
import { AbiItem } from 'web3-utils';
import factoryAbi from './abi/factory.json';
import stakeManagerAbi from './abi/stakeManager.json';
import devConfig from './dev.json';
import prodConfig from './prod.json';

export const evmLsdTokens: EvmLsdTokenConfig[] = isDev()
  ? devConfig.lsdTokens
  : prodConfig.lsdTokens;

export const getEvmFactoryAbi = () => {
  return factoryAbi as AbiItem[];
};

export const getEvmStakeManagerAbi = () => {
  return stakeManagerAbi as AbiItem[];
};

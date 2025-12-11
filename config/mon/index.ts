import { isDev } from 'config/common';
import { AbiItem } from 'web3-utils';
import factoryAbi from './abi/factory.json';
import stakeManagerAbi from './abi/stakeManager.json';
import lsdTokenAbi from './abi/lsdToken.json';
import devConfig from './dev.json';
import prodConfig from './prod.json';

export const monConfig = isDev() ? devConfig : prodConfig;

export const getMonFactoryAbi = () => {
  return factoryAbi as AbiItem[];
};

export const getMonStakeManagerAbi = () => {
  return stakeManagerAbi as AbiItem[];
};

export const getMonLsdTokenAbi = () => {
  return lsdTokenAbi as AbiItem[];
};

export const getMonStackAppUrl = () => {
  return 'https://test-ulst-app.stafi.io';
};

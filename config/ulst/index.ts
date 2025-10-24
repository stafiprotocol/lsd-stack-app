import { isDev } from 'config/common';
import { AbiItem } from 'web3-utils';
import factoryAbi from './abi/factory.json';
import stakeManagerAbi from './abi/stakeManager.json';
import lsdTokenAbi from './abi/lsdToken.json';
import devConfig from './dev.json';
import prodConfig from './prod.json';

export const ulstConfig = isDev() ? devConfig : prodConfig;

export const getUlstFactoryAbi = () => {
  return factoryAbi as AbiItem[];
};

export const getUlstStakeManagerAbi = () => {
  return stakeManagerAbi as AbiItem[];
};

export const getUlstLsdTokenAbi = () => {
  return lsdTokenAbi as AbiItem[];
};

export const getUlstStackAppUrl = () => {
  return 'https://test-ulst-app.stafi.io';
};

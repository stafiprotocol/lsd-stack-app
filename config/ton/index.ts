import { isDev } from 'config/common';
import devConfig from './dev.json';
import prodConfig from './prod.json';

export const tonRestEndpoint = isDev()
  ? devConfig.restEndpoint
  : prodConfig.restEndpoint;

export const stackContractAddress = isDev()
  ? devConfig.stackContractAddress
  : prodConfig.stackContractAddress;

export const getTonStackAppUrl = () => {
  return 'https://docs.stafi.io/lsaas/develop_ton_lsd/deploy/';
};

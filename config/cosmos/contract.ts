import { isDev } from 'config/common';
import appDevConfig from './dev.json';
import appProdConfig from './prod.json';

/**
 * get neutron stakeManager contract address
 */
export function getNeutronStakeManagerContract() {
  if (isDev()) {
    return appDevConfig.stakeManagerContract;
  }
  return appProdConfig.stakeManagerContract;
}

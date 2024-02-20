import { isDev } from "config/env";
import appDevConfig from "./dev.json";
import appProdConfig from "./prod.json";

/**
 * get neutron stakeManager contract address
 */
export function getStakeManagerContract() {
  if (isDev()) {
    return appDevConfig.stakeManagerContract;
  }
  return appProdConfig.stakeManagerContract;
}

/**
 * get neutron poolAddress
 */
export function getPoolAddress() {
  if (isDev()) {
    return appDevConfig.poolAddress;
  }
  return appProdConfig.poolAddress;
}

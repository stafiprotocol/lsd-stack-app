import { CosmosChainConfig, LsdTokenConfig } from 'interfaces/common';
import devConfig from './dev.json';
import prodConfig from './prod.json';
import { isDev } from 'config/env';

export const neutronChainConfig: CosmosChainConfig = isDev()
  ? devConfig.chains.neutron
  : prodConfig.chains.neutron;

export const lsdTokenConfigs: LsdTokenConfig[] = isDev()
  ? devConfig.lsdTokens
  : prodConfig.lsdTokens;

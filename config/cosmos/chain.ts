import { CosmosChainConfig, CosmosLsdTokenConfig } from 'interfaces/common';
import devConfig from './dev.json';
import prodConfig from './prod.json';
import { isDev } from 'config/common';

export const neutronChainConfig: CosmosChainConfig = isDev()
  ? devConfig.chains.neutron
  : prodConfig.chains.neutron;

export const lsdTokenConfigs: CosmosLsdTokenConfig[] = isDev()
  ? devConfig.lsdTokens
  : prodConfig.lsdTokens;

export const cosmosExplorerUrl = isDev()
  ? devConfig.cosmosExplorerUrl
  : prodConfig.cosmosExplorerUrl;

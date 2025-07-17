import { isDev } from 'config/common';
import devConfig from './dev.json';
import prodConfig from './prod.json';

export const solanaPrograms = isDev()
  ? devConfig.programs
  : prodConfig.programs;

export const solanaRestEndpoint = isDev()
  ? devConfig.restEndpoint
  : prodConfig.restEndpoint;

export const solanaExplorer = isDev()
  ? devConfig.explorer
  : prodConfig.explorer;

export const solanaDevConfig = devConfig;
export const solanaProdConfig = prodConfig;

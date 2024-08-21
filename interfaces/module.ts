import { AppEco, ModuleType } from './common';

export interface ModuleSetting {
  //   type: 'ai' | 'point' | 'frontend';
  myKey: string;
  eco: AppEco;
  userAddress: string;
  disabled: boolean;
  tokenName: string;
  tokenAddress: string;
  config: ModuleConfigContainer;
}

type ModuleConfig = {
  ai: AiValidatorModuleConfig;
  point: PointModuleConfig;
  frontend: FrontendModuleConfig;
};

type ModuleConfigContainer = {
  [K in keyof ModuleConfig]: { type: K; config: ModuleConfig[K] };
}[keyof ModuleConfig];

export interface AiValidatorModuleConfig {
  modelId: string;
  validatorNumber: string;
  prefix: string;
}

export interface PointModuleConfig {
  frequency: '1 day' | '1 hour';
  speed: string;
  minimalDeposit: string;
}

export interface FrontendModuleConfig {}

export interface ExternalModuleCardConfig {
  type: ModuleType;
  title: string;
  description: string;
  externalLink: string;
  tutorialLink: string;
}

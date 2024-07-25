import { AppEco, ModuleType } from 'interfaces/common';
import eth from 'public/images/tokens/eth.svg';
import ai from 'public/images/module/ai.svg';
import pointSystem from 'public/images/module/point_system.svg';
import frontend from 'public/images/module/frontend.svg';

export function getEcoTokenIcon(eco: AppEco | null) {
  switch (eco) {
    case AppEco.Eth:
      return eth;
  }

  return eth;
}

export function getModuleIcon(moduleType: 'ai' | 'point' | 'frontend') {
  switch (moduleType) {
    case 'ai':
      return ai;
    case 'point':
      return pointSystem;
    case 'frontend':
      return frontend;
  }

  return ai;
}

export function getModuleName(moduleType: 'ai' | 'point' | 'frontend') {
  switch (moduleType) {
    case 'ai':
      return 'Validator Selection';
    case 'point':
      return 'Point System';
    case 'frontend':
      return 'Frontend';
  }

  return ai;
}

import { AppEco, ModuleType } from 'interfaces/common';
import eth from 'public/images/tokens/eth.svg';
import ai from 'public/images/module/ai.svg';
import pointSystem from 'public/images/module/point_system.svg';

export function getEcoTokenIcon(eco: AppEco | null) {
  switch (eco) {
    case AppEco.Eth:
      return eth;
  }

  return eth;
}

export function getModuleIcon(module: ModuleType | null) {
  switch (module) {
    case ModuleType.Ai:
      return ai;
    case ModuleType.PointSystem:
      return pointSystem;
  }

  return ai;
}

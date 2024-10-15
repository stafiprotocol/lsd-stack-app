import { AppEco, ModuleType } from 'interfaces/common';
import eth from 'public/images/tokens/eth.svg';
import atom from 'public/images/tokens/atom.svg';
import ai from 'public/images/module/ai.svg';
import pointSystem from 'public/images/module/point_system.svg';
import frontend from 'public/images/module/frontend.svg';
import moduleStateError from 'public/images/module/state_error.svg';
import moduleStateNotSet from 'public/images/module/state_not_set.svg';
import moduleStateRunning from 'public/images/module/state_running.svg';
import moduleStatePaused from 'public/images/module/state_paused.svg';
import moduleStateStateless from 'public/images/module/state_stateless.svg';
import EcoCosmosImg from 'public/images/eco/cosmos.svg';
import EcoEthImg from 'public/images/eco/eth.png';
import EcoEvmImg from 'public/images/eco/evm.png';
import EcoLrtImg from 'public/images/eco/lrt.png';
import EcoSelectedImg from 'public/images/eco/selected.svg';
import EcoSolanaImg from 'public/images/eco/solana.png';
import EcoTonImg from 'public/images/eco/ton.svg';

export function getEcoTokenIcon(eco: AppEco | null) {
  return eco === AppEco.Cosmos
    ? EcoCosmosImg
    : eco === AppEco.Lrt
    ? EcoLrtImg
    : eco === AppEco.Evm
    ? EcoEvmImg
    : eco === AppEco.Sol
    ? EcoSolanaImg
    : eco === AppEco.Ton
    ? EcoTonImg
    : EcoEthImg;
}

export function getModuleIcon(moduleType: ModuleType) {
  switch (moduleType) {
    case ModuleType.Ai:
      return ai;
    case ModuleType.PointSystem:
      return pointSystem;
    case ModuleType.Frontend:
      return frontend;
  }
  return frontend;
}

export function getModuleStateIcon(
  state: 'running' | 'paused' | 'not set' | 'stateless' | 'error'
) {
  switch (state) {
    case 'running':
      return moduleStateRunning;
    case 'paused':
      return moduleStatePaused;
    case 'not set':
      return moduleStateNotSet;
    case 'stateless':
      return moduleStateStateless;
    case 'error':
      return moduleStateError;
  }
}

export function getModuleName(moduleType: ModuleType) {
  switch (moduleType) {
    case ModuleType.Ai:
      return 'Validator Selection';
    case ModuleType.PointSystem:
      return 'Point System';
    case ModuleType.Frontend:
      return 'Frontend';
  }

  return '';
}

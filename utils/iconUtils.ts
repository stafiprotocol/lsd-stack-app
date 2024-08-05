import { AppEco, ModuleType } from 'interfaces/common';
import eth from 'public/images/tokens/eth.svg';
import atom from 'public/images/tokens/atom.svg';
import ai from 'public/images/module/ai.svg';
import pointSystem from 'public/images/module/point_system.svg';
import frontend from 'public/images/module/frontend.svg';
import EcoCosmosImg from 'public/images/eco/cosmos.svg';
import EcoEthImg from 'public/images/eco/eth.png';
import EcoEvmImg from 'public/images/eco/evm.png';
import EcoLrtImg from 'public/images/eco/lrt.png';
import EcoSelectedImg from 'public/images/eco/selected.svg';
import EcoSolanaImg from 'public/images/eco/solana.png';

export function getEcoTokenIcon(eco: AppEco | null) {
  return eco === AppEco.Cosmos
    ? EcoCosmosImg
    : eco === AppEco.Lrt
    ? EcoLrtImg
    : eco === AppEco.Evm
    ? EcoEvmImg
    : eco === AppEco.Sol
    ? EcoSolanaImg
    : EcoEthImg;
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

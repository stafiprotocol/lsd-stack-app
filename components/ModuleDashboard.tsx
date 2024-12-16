import { AppEco, ModuleType } from 'interfaces/common';
import { AiModuleCard } from './AiModuleCard';
import { FrontendModuleCard } from './FrontendModuleCard';
import { PointSystemModuleCard } from './PointSystemModuleCard';
import { CCIPModuleCard } from './CCIPModuleCard';
import { modularConfigs } from 'config/modular';
import { ExternalModulerCard } from './ExternalModulerCard';

interface Props {
  eco: AppEco;
  lsdTokenName?: string;
  lsdTokenAddress?: string;
  userAddress?: string;
}

export const ModuleDashboard = (props: Props) => {
  const { lsdTokenName, lsdTokenAddress, eco, userAddress } = props;

  if (!lsdTokenName || !lsdTokenAddress) {
    return null;
  }

  // @ts-ignore
  const supportAi = modularConfigs.supportList[eco].includes(ModuleType.Ai);
  // @ts-ignore
  const supportPointSystem = modularConfigs.supportList[eco].includes(
    ModuleType.PointSystem
  );
  // @ts-ignore
  const supportFrontend = modularConfigs.supportList[eco].includes(
    ModuleType.Frontend
  );

  const supportExternalModules = modularConfigs.externalModules.filter(
    (module) => {
      // @ts-ignore
      return modularConfigs.supportList[eco].includes(module.type);
    }
  );

  return (
    <div className="flex gap-[.36rem] flex-wrap">
      {supportAi && (
        <AiModuleCard
          eco={eco}
          lsdTokenAddress={lsdTokenAddress}
          lsdTokenName={lsdTokenName}
        />
      )}

      {supportPointSystem && (
        <PointSystemModuleCard
          eco={eco}
          lsdTokenAddress={lsdTokenAddress}
          lsdTokenName={lsdTokenName}
          userAddress={userAddress}
        />
      )}

      {supportFrontend && (
        <FrontendModuleCard
          eco={eco}
          lsdTokenAddress={lsdTokenAddress}
          lsdTokenName={lsdTokenName}
        />
      )}

      {supportExternalModules.map((module, index) => (
        <ExternalModulerCard
          key={index}
          eco={eco}
          config={module}
          lsdTokenAddress={lsdTokenAddress}
          lsdTokenName={lsdTokenName}
        />
      ))}
    </div>
  );
};

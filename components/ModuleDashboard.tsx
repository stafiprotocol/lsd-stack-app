import { AppEco } from 'interfaces/common';
import { AiModuleCard } from './AiModuleCard';
import { FrontendModuleCard } from './FrontendModuleCard';
import { PointSystemModuleCard } from './PointSystemModuleCard';
import { CCIPModuleCard } from './CCIPModuleCard';

interface Props {
  eco: AppEco;
  lsdTokenName?: string;
  lsdTokenAddress?: string;
}

export const ModuleDashboard = (props: Props) => {
  const { lsdTokenName, lsdTokenAddress, eco } = props;

  if (!lsdTokenName || !lsdTokenAddress) {
    return null;
  }

  return (
    <div className="flex gap-[.36rem]">
      {eco === AppEco.Cosmos && (
        <AiModuleCard
          eco={eco}
          lsdTokenAddress={lsdTokenAddress}
          lsdTokenName={lsdTokenName}
        />
      )}

      {eco !== AppEco.Sol && eco !== AppEco.Cosmos && (
        <PointSystemModuleCard
          eco={eco}
          lsdTokenAddress={lsdTokenAddress}
          lsdTokenName={lsdTokenName}
        />
      )}

      <FrontendModuleCard
        eco={eco}
        lsdTokenAddress={lsdTokenAddress}
        lsdTokenName={lsdTokenName}
      />

      {eco === AppEco.Eth && (
        <CCIPModuleCard
          eco={eco}
          lsdTokenAddress={lsdTokenAddress}
          lsdTokenName={lsdTokenName}
        />
      )}
    </div>
  );
};

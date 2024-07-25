import classNames from 'classnames';
import { robotoSemiBold } from 'config/font';
import Image from 'next/image';
import { CustomButton } from './common/CustomButton';
import { AiModuleCard } from './AiModuleCard';
import { PointSystemModuleCard } from './PointSystemModuleCard';
import { FrontendModuleCard } from './FrontendModuleCard';
import { AppEco } from 'interfaces/common';

interface Props {
  lsdTokenName?: string;
  lsdTokenAddress?: string;
}

export const EthModuleDashboard = (props: Props) => {
  const { lsdTokenName, lsdTokenAddress } = props;
  if (!lsdTokenName || !lsdTokenAddress) {
    return null;
  }

  return (
    <div className="flex gap-[.36rem]">
      <AiModuleCard
        eco={AppEco.Eth}
        lsdTokenAddress={lsdTokenAddress}
        lsdTokenName={lsdTokenName}
      />

      <PointSystemModuleCard
        eco={AppEco.Eth}
        lsdTokenAddress={lsdTokenAddress}
        lsdTokenName={lsdTokenName}
      />

      <FrontendModuleCard
        eco={AppEco.Eth}
        lsdTokenAddress={lsdTokenAddress}
        lsdTokenName={lsdTokenName}
      />
    </div>
  );
};

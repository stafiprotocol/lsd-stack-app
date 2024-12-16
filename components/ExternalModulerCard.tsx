import classNames from 'classnames';
import {
  getCosmosStackAppUrl,
  getEthStackAppUrl,
  getEvmCaseUrl,
  getLrtCaseUrl,
} from 'config/eth/env';
import { robotoSemiBold } from 'config/font';
import { useUserAddress } from 'hooks/useUserAddress';
import { AppEco } from 'interfaces/common';
import Image from 'next/image';
import { openLink } from 'utils/commonUtils';
import { saveModuleToDb } from 'utils/dbUtils';
import { CustomButton } from './common/CustomButton';
import { ModuleStatePanel } from './ModuleStatePanel';
import { ExternalModuleCardConfig } from 'interfaces/module';

interface Props {
  eco: AppEco;
  lsdTokenName?: string;
  lsdTokenAddress?: string;
  config: ExternalModuleCardConfig;
}

export const ExternalModulerCard = (props: Props) => {
  const { lsdTokenAddress, lsdTokenName, eco, config } = props;
  const userAddress = useUserAddress(eco);

  return (
    <div className="w-[3.1rem] h-[3.16rem] flex flex-col items-stretch px-[.24rem] bg-color-bg2 rounded-[.3rem] border-[.01rem] border-color-border1">
      <div className="mt-[.2rem] flex items-center">
        <div className="w-[.34rem] h-[.34rem] relative">
          <Image
            src="/images/module/frontend_color.svg"
            layout="fill"
            alt="icon"
          />
        </div>

        <div className="ml-[.12rem]">
          <div
            className={classNames(
              'text-text1 text-[.24rem]',
              robotoSemiBold.className
            )}
          >
            {config.title}
          </div>

          <ModuleStatePanel state="stateless" text="Functions" />
        </div>
      </div>

      <div className="flex-1 text-[#6C86AD80] text-[.14rem] mt-[.16rem] leading-[.21rem] tracking-tight">
        {config.description}
      </div>

      <CustomButton
        className="mb-[.12rem]"
        type="external"
        onClick={async () => {
          openLink(config.externalLink);
        }}
      >
        Open External Module
      </CustomButton>

      <CustomButton
        className="mb-[.24rem]"
        type="stroke"
        onClick={() => {
          openLink(config.tutorialLink);
        }}
      >
        Tutorial
      </CustomButton>
    </div>
  );
};

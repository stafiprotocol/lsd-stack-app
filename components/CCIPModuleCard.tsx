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

interface Props {
  eco: AppEco;
  lsdTokenName?: string;
  lsdTokenAddress?: string;
}

export const CCIPModuleCard = (props: Props) => {
  const { lsdTokenAddress, lsdTokenName, eco } = props;
  const userAddress = useUserAddress(eco);

  return (
    <div className="w-[3.1rem] h-[3rem] flex flex-col items-stretch px-[.24rem] bg-color-bg2 rounded-[.3rem] border-[.01rem] border-color-border1">
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
            Chainlink CCIP
          </div>

          <ModuleStatePanel state="stateless" text="Functions" />
        </div>
      </div>

      <div className="flex-1 text-[#6C86AD80] text-[.14rem] mt-[.16rem] leading-normal">
        By seamlessly integrating Chainlink&lsquo;s robust and secure CCIP
        functions, this module empowers developers to build and operate dApps
        with cross-chain capabilities.
      </div>

      <CustomButton
        className="mb-[.24rem]"
        type="external"
        onClick={async () => {
          openLink(
            'https://lsaas-docs.stafi.io/docs/modules/ccip_modules.html'
          );
        }}
      >
        Open External Module
      </CustomButton>
    </div>
  );
};

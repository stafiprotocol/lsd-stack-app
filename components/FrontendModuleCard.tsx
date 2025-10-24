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
import { getTonStackAppUrl } from 'config/ton';
import { getUlstStackAppUrl } from 'config/ulst';

interface Props {
  eco: AppEco;
  lsdTokenName?: string;
  lsdTokenAddress?: string;
}

export const FrontendModuleCard = (props: Props) => {
  const { lsdTokenAddress, lsdTokenName, eco } = props;
  const userAddress = useUserAddress(eco);

  return (
    <div className="w-[3.1rem] h-[3.16rem]  flex flex-col items-stretch px-[.24rem] bg-color-bg2 rounded-[.3rem] border-[.01rem] border-color-border1">
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
            Frontend
          </div>

          <ModuleStatePanel state="stateless" text="Functions" />
        </div>
      </div>

      <div className="flex-1 text-[#6C86AD80] text-[.14rem] mt-[.16rem] leading-normal">
        From local testing to live deployment, this module covers both frontend
        preview and hosting.
      </div>

      <CustomButton
        className="mb-[.12rem]"
        type="primary"
        onClick={async () => {
          if (eco === AppEco.Cosmos) {
            openLink(getCosmosStackAppUrl());
          } else if (eco === AppEco.Lrt) {
            openLink(getLrtCaseUrl());
          } else if (eco === AppEco.Evm) {
            openLink(getEvmCaseUrl());
          } else if (eco === AppEco.Eth) {
            openLink(getEthStackAppUrl());
          } else if (eco === AppEco.Ton) {
            openLink(getTonStackAppUrl());
          } else if (eco === AppEco.Ulst) {
            openLink(getUlstStackAppUrl());
          } else {
            openLink('https://docs.stafi.io/lsaas/modules/frontend/');
          }

          if (!userAddress || !lsdTokenAddress || !lsdTokenName) {
            return;
          }
          const saved = await saveModuleToDb({
            myKey: `frontend-${lsdTokenAddress}`,
            eco: eco,
            userAddress: userAddress,
            disabled: false,
            tokenName: lsdTokenName,
            tokenAddress: lsdTokenAddress,
            config: {
              type: 'frontend',
              config: {},
            },
          });
        }}
      >
        Preview
      </CustomButton>

      <CustomButton
        className="mb-[.24rem]"
        type="stroke"
        onClick={() => {
          if (eco === AppEco.Ulst) {
            openLink('https://docs.stafi.io/lsaas/develop_ulst/app/');
          } else {
            openLink('https://docs.stafi.io/lsaas/modules/frontend/');
          }
        }}
      >
        Tutorial
      </CustomButton>
    </div>
  );
};

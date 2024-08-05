import classNames from 'classnames';
import { robotoSemiBold } from 'config/font';
import Image from 'next/image';
import { CustomButton } from './common/CustomButton';
import { SetPointSystemModal } from './modal/SetPointSystemModal';
import { useState } from 'react';
import { SetPointSystemReadyModal } from './modal/SetPointSystemReadyModal';
import { getDocHost } from 'config/common';
import { openLink } from 'utils/commonUtils';
import { AppEco } from 'interfaces/common';
import { saveModuleToDb } from 'utils/dbUtils';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { useUserAddress } from 'hooks/useUserAddress';
import {
  getCosmosStackAppUrl,
  getEthStackAppUrl,
  getEvmCaseUrl,
  getLrtCaseUrl,
} from 'config/eth/env';

interface Props {
  eco: AppEco;
  lsdTokenName?: string;
  lsdTokenAddress?: string;
}

export const FrontendModuleCard = (props: Props) => {
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
            Frontend
          </div>

          <div className="mt-[.06rem] flex items-center">
            <div className="text-text2 text-[.14rem]">Functionality</div>
          </div>
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
          } else {
            openLink('https://lsaas-docs.stafi.io/docs/modules/frontend.html');
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
          openLink('https://lsaas-docs.stafi.io/docs/modules/frontend.html');
        }}
      >
        Tutorial
      </CustomButton>
    </div>
  );
};

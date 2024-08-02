import classNames from 'classnames';
import { robotoSemiBold } from 'config/font';
import Image from 'next/image';
import { CustomButton } from './common/CustomButton';
import { SetPointSystemModal } from './modal/SetPointSystemModal';
import { useEffect, useState } from 'react';
import { SetPointSystemReadyModal } from './modal/SetPointSystemReadyModal';
import { getDocHost } from 'config/common';
import { ModuleSetting, PointModuleConfig } from 'interfaces/module';
import { getModuleSettingFromDb, saveModuleToDb } from 'utils/dbUtils';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { AppEco } from 'interfaces/common';
import { ModuleStateTag } from './ModuleStateTag';
import { useUserAddress } from 'hooks/useUserAddress';

interface Props {
  eco: AppEco;
  lsdTokenName?: string;
  lsdTokenAddress?: string;
}

export const PointSystemModuleCard = (props: Props) => {
  const { lsdTokenAddress, lsdTokenName, eco } = props;
  const userAddress = useUserAddress(eco);
  const [setttingModalOpen, setSettingModalOpen] = useState(false);
  const [readyModalOpen, setReadyModalOpen] = useState(false);
  const [existSetting, setExistSetting] = useState<ModuleSetting>();

  useEffect(() => {
    (async () => {
      const record = await getModuleSettingFromDb('point', lsdTokenAddress);
      if (record) {
        setExistSetting(record);
      }
    })();
  }, [lsdTokenAddress]);

  return (
    <div className="w-[3.1rem] h-[3rem] flex flex-col items-stretch px-[.24rem] bg-color-bg2 rounded-[.3rem] border-[.01rem] border-color-border1">
      <div className="mt-[.2rem] flex items-center">
        <div className="w-[.34rem] h-[.34rem] relative">
          <Image src="/images/module/ai_color.svg" layout="fill" alt="icon" />
        </div>

        <div className="ml-[.12rem]">
          <div
            className={classNames(
              'text-text1 text-[.24rem]',
              robotoSemiBold.className
            )}
          >
            Point System
          </div>

          <div className="mt-[.06rem] flex items-center">
            <div className="text-text2 text-[.14rem]">Marketing</div>

            <ModuleStateTag
              state={
                !existSetting
                  ? 'not set'
                  : existSetting.disabled
                  ? 'paused'
                  : 'running'
              }
              className="ml-{.14rem}"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 text-[#6C86AD80] text-[.14rem] mt-[.16rem] leading-normal">
        Unleash granular control with lst and lrt point functions, alongside
        customizable point emission rules.
      </div>

      <CustomButton
        className="mb-[.24rem]"
        type="primary"
        onClick={async () => {
          if (!existSetting || existSetting.disabled) {
            setSettingModalOpen(true);
          } else {
            const saved = await saveModuleToDb({
              ...existSetting,
              disabled: true,
            });
            setExistSetting(saved);
          }
        }}
      >
        {existSetting && !existSetting.disabled
          ? 'Disable Module'
          : 'Open Module'}
      </CustomButton>

      <SetPointSystemModal
        eco={eco}
        userAddress={userAddress}
        open={setttingModalOpen}
        close={() => {
          setSettingModalOpen(false);
        }}
        currentConfig={existSetting?.config?.config as PointModuleConfig}
        onSuccess={async (config: PointModuleConfig) => {
          if (!userAddress || !lsdTokenName || !lsdTokenAddress) {
            return;
          }
          const saved = await saveModuleToDb({
            myKey: `point-${lsdTokenAddress}`,
            eco: eco,
            userAddress: userAddress,
            disabled: false,
            tokenName: lsdTokenName,
            tokenAddress: lsdTokenAddress,
            config: {
              type: 'point',
              config: config,
            },
          });

          setSettingModalOpen(false);
          setReadyModalOpen(true);
          setExistSetting(saved);
        }}
      />

      <SetPointSystemReadyModal
        tutorialUrl={`${getDocHost()}/docs/develop_evm_lsd/deploy.html`}
        open={readyModalOpen}
        close={() => {
          setReadyModalOpen(false);
        }}
      />
    </div>
  );
};

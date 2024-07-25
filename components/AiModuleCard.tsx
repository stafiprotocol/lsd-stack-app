import classNames from 'classnames';
import { robotoSemiBold } from 'config/font';
import Image from 'next/image';
import { CustomButton } from './common/CustomButton';
import { SetPointSystemModal } from './modal/SetPointSystemModal';
import { useEffect, useState } from 'react';
import { SetAiValidatorModal } from './modal/SetAiValidatorModal';
import { SetAiValidatorReadyModal } from './modal/SetAiValidatorReadyModal';
import { getDocHost } from 'config/common';
import { AppEco } from 'interfaces/common';
import { AiValidatorModuleConfig, ModuleSetting } from 'interfaces/module';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { getModuleSettingFromDb, saveModuleToDb } from 'utils/dbUtils';
import { ModuleStateTag } from './ModuleStateTag';
import { useUserAddress } from 'hooks/useUserAddress';

interface Props {
  eco: AppEco;
  lsdTokenName?: string;
  lsdTokenAddress?: string;
}

export const AiModuleCard = (props: Props) => {
  const { lsdTokenAddress, lsdTokenName, eco } = props;
  const userAddress = useUserAddress(eco);
  const [setttingModalOpen, setSettingModalOpen] = useState(false);
  const [readyModalOpen, setReadyModalOpen] = useState(false);
  const [existSetting, setExistSetting] = useState<ModuleSetting>();

  useEffect(() => {
    (async () => {
      const record = await getModuleSettingFromDb('ai', lsdTokenAddress);
      if (record) {
        setExistSetting(record);
      }
    })();
  }, [lsdTokenAddress]);

  const openAiModule = async () => {
    const params = {
      modelId: 'gpt-4o',
      resultNum: 5,
      prefix: 'cosmos',
    };

    const setResponse = await fetch(
      'https://staking-api.stafi.io/election/api/v1/selectedValidators',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );
    const setResponseJson = await setResponse.json();
    console.log({ setResponseJson });
  };

  return (
    <div className="w-[3.1rem] h-[3rem] px-[.24rem] flex flex-col items-stretch bg-color-bg2 rounded-[.3rem] border-[.01rem] border-color-border1">
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
            Validator Selection
          </div>

          <div className="mt-[.06rem] flex items-center">
            <div className="text-text2 text-[.14rem]">AI Agent</div>

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
        The Validator Selection AI Agent empowers informed choices. Learn about
        its functionalities, including simulating validation results and setting
        custom parameters
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

      <SetAiValidatorModal
        open={setttingModalOpen}
        userAddress={userAddress}
        close={() => {
          setSettingModalOpen(false);
        }}
        currentConfig={existSetting?.config?.config as AiValidatorModuleConfig}
        onSuccess={async (config: AiValidatorModuleConfig) => {
          if (!userAddress || !lsdTokenName || !lsdTokenAddress) {
            return;
          }
          const saved = await saveModuleToDb({
            myKey: `ai-${lsdTokenAddress}`,
            eco: eco,
            userAddress: userAddress,
            disabled: false,
            tokenName: lsdTokenName,
            tokenAddress: lsdTokenAddress,
            config: {
              type: 'ai',
              config: config,
            },
          });
          setExistSetting(saved);
          setSettingModalOpen(false);
          setReadyModalOpen(true);
        }}
      />

      <SetAiValidatorReadyModal
        toturialUrl={`${getDocHost()}/docs/develop_cosmos_lsd/deploy.html`}
        open={readyModalOpen}
        close={() => {
          setReadyModalOpen(false);
        }}
      />
    </div>
  );
};

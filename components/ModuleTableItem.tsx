import classNames from 'classnames';
import Image from 'next/image';
import { getEcoTokenIcon, getModuleIcon, getModuleName } from 'utils/iconUtils';
import { CustomButton } from './common/CustomButton';
import {
  AiValidatorModuleConfig,
  ModuleSetting,
  PointModuleConfig,
} from 'interfaces/module';
import { AppEco, ModuleType } from 'interfaces/common';
import { ModuleStateTag } from './ModuleStateTag';
import { getModuleSettingFromDb, saveModuleToDb } from 'utils/dbUtils';
import { openLink } from 'utils/commonUtils';
import { useCallback, useEffect, useState } from 'react';
import { SetPointSystemModal } from './modal/SetPointSystemModal';
import { SetAiValidatorModal } from './modal/SetAiValidatorModal';
import { useUserAddress } from 'hooks/useUserAddress';
import { LsdHistoryItem } from 'hooks/useModuleList';
import {
  getCosmosStackAppUrl,
  getEthStackAppUrl,
  getEvmCaseUrl,
  getLrtCaseUrl,
} from 'config/eth/env';

interface ModuleTableItemProps {
  index: number;
  eco: AppEco;
  type: ModuleType;
  lsdHistoryItem: LsdHistoryItem;
}

export const ModuleTableItem = (props: ModuleTableItemProps) => {
  const { index, type, eco, lsdHistoryItem } = props;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const userAddress = useUserAddress(eco);
  const [moduleSetting, setModuleSetting] = useState<ModuleSetting>();

  const updateModule = useCallback(async () => {
    const moduleSetting = await getModuleSettingFromDb(
      type,
      lsdHistoryItem.tokenAddress
    );
    setModuleSetting(moduleSetting);
  }, [lsdHistoryItem.tokenAddress, type]);

  useEffect(() => {
    updateModule();
  }, [updateModule]);

  return (
    <div
      className={classNames(
        'h-[.74rem] grid items-center font-[500]',
        index % 2 === 0 ? 'bg-bgPage/50 dark:bg-bgPageDark/50' : ''
      )}
      style={{
        gridTemplateColumns: '22% 22% 10% 46%',
      }}
    >
      <div className="pl-[.28rem] flex items-center justify-start text-[.16rem] text-color-text1">
        <div
          className="cursor-pointer flex-1 h-[.42rem] flex items-center rounded-[.6rem] "
          onClick={() => {}}
        >
          <div className="flex items-center">
            <div className="w-[.34rem] h-[.34rem] min-w-[.34rem] relative ml-[.04rem]">
              <Image src={getEcoTokenIcon(eco)} alt="logo" layout="fill" />
            </div>

            <div className="ml-[.16rem] text-[.16rem] text-color-text1">
              {lsdHistoryItem.tokenName}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        <div className="w-[.34rem] h-[.34rem] min-w-[.34rem] relative mr-[.16rem]">
          <Image src={getModuleIcon(type)} alt="logo" layout="fill" />
        </div>

        {getModuleName(type)}
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        {(type === 'ai' || type === 'point') && (
          <ModuleStateTag
            state={
              !moduleSetting
                ? 'not set'
                : moduleSetting.disabled
                ? 'paused'
                : 'running'
            }
            className="ml-[0rem]"
          />
        )}
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        {type === 'frontend' ? (
          <CustomButton
            type="primary"
            width="1.3rem"
            className="mr-[.24rem]"
            onClick={() => {
              if (eco === AppEco.Cosmos) {
                openLink(getCosmosStackAppUrl());
              } else if (eco === AppEco.Lrt) {
                openLink(getLrtCaseUrl());
              } else if (eco === AppEco.Evm) {
                openLink(getEvmCaseUrl());
              } else if (eco === AppEco.Eth) {
                openLink(getEthStackAppUrl());
              } else {
                openLink(
                  'https://lsaas-docs.stafi.io/docs/modules/frontend.html'
                );
              }
            }}
          >
            Preview
          </CustomButton>
        ) : type === 'ai' || type === 'point' ? (
          <CustomButton
            type="primary"
            width="1.3rem"
            className="mr-[.24rem]"
            onClick={() => {
              setEditModalOpen(true);
            }}
          >
            Edit
          </CustomButton>
        ) : null}

        {type === 'ccip' && (
          <CustomButton
            type="external"
            width="1.3rem"
            className="mr-[.24rem]"
            onClick={() => {
              openLink('https://chain.link/cross-chain');
            }}
          >
            Open External
          </CustomButton>
        )}

        <CustomButton
          type="stroke"
          width="1.3rem"
          className=""
          onClick={() => {
            if (type === 'frontend') {
              openLink(
                'https://lsaas-docs.stafi.io/docs/modules/frontend.html'
              );
            } else if (type === 'ai') {
              openLink(
                'https://lsaas-docs.stafi.io/docs/modules/validator_selection_ai_agent.html'
              );
            } else if (type === 'point') {
              openLink(
                'https://lsaas-docs.stafi.io/docs/modules/point_system.html'
              );
            } else if (type === 'ccip') {
              openLink(
                'https://lsaas-docs.stafi.io/docs/modules/ccip_modules.html'
              );
            } else {
              openLink(
                'https://lsaas-docs.stafi.io/docs/modules/introduction.html'
              );
            }
          }}
        >
          Tutorial
        </CustomButton>

        {(type === 'ai' || type === 'point') && (
          <CustomButton
            type="stroke"
            width="1.3rem"
            className="ml-[.24rem]"
            onClick={async () => {
              if (!moduleSetting || moduleSetting.disabled) {
                setEditModalOpen(true);
              } else {
                await saveModuleToDb({
                  ...moduleSetting,
                  disabled: true,
                });
                updateModule();
              }
            }}
          >
            {!moduleSetting || moduleSetting.disabled ? 'Turn on' : 'Turn off'}
          </CustomButton>
        )}
      </div>

      <SetPointSystemModal
        eco={eco}
        userAddress={userAddress}
        open={editModalOpen && type === 'point'}
        close={() => {
          setEditModalOpen(false);
        }}
        currentConfig={moduleSetting?.config?.config as PointModuleConfig}
        onSuccess={async (config: PointModuleConfig) => {
          const saved = await saveModuleToDb({
            myKey: `point-${lsdHistoryItem.tokenAddress}`,
            eco: eco,
            userAddress: userAddress || '',
            disabled: false,
            tokenName: lsdHistoryItem.tokenName,
            tokenAddress: lsdHistoryItem.tokenAddress,
            config: {
              type: 'point',
              config: config,
            },
          });
          setEditModalOpen(false);
          updateModule();
        }}
      />

      <SetAiValidatorModal
        userAddress={userAddress}
        open={editModalOpen && type === 'ai'}
        close={() => {
          setEditModalOpen(false);
        }}
        currentConfig={moduleSetting?.config?.config as AiValidatorModuleConfig}
        onSuccess={async (config: AiValidatorModuleConfig) => {
          const saved = await saveModuleToDb({
            myKey: `ai-${lsdHistoryItem.tokenAddress}`,
            eco: eco,
            userAddress: userAddress || '',
            disabled: false,
            tokenName: lsdHistoryItem.tokenName,
            tokenAddress: lsdHistoryItem.tokenAddress,
            config: {
              type: 'ai',
              config: config,
            },
          });
          setEditModalOpen(false);
          updateModule();
        }}
      />
    </div>
  );
};

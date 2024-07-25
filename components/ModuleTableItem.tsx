import classNames from 'classnames';
import Image from 'next/image';
import { getEcoTokenIcon, getModuleIcon, getModuleName } from 'utils/iconUtils';
import { CustomButton } from './common/CustomButton';
import {
  AiValidatorModuleConfig,
  ModuleSetting,
  PointModuleConfig,
} from 'interfaces/module';
import { AppEco } from 'interfaces/common';
import { ModuleStateTag } from './ModuleStateTag';
import { saveModuleToDb } from 'utils/dbUtils';
import { openLink } from 'utils/commonUtils';
import { useState } from 'react';
import { SetPointSystemModal } from './modal/SetPointSystemModal';
import { SetAiValidatorModal } from './modal/SetAiValidatorModal';
import { useUserAddress } from 'hooks/useUserAddress';

interface ModuleTableItemProps {
  index: number;
  eco: AppEco;
  moduleSetting: ModuleSetting;
  onUpdate: () => void;
}

export const ModuleTableItem = (props: ModuleTableItemProps) => {
  const { index, eco, moduleSetting, onUpdate } = props;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const userAddress = useUserAddress(eco);

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
              {moduleSetting.tokenName}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        <div className="w-[.34rem] h-[.34rem] min-w-[.34rem] relative mr-[.16rem]">
          <Image
            src={getModuleIcon(moduleSetting.config.type)}
            alt="logo"
            layout="fill"
          />
        </div>

        {getModuleName(moduleSetting.config.type)}
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        <ModuleStateTag
          state={moduleSetting.disabled ? 'paused' : 'running'}
          className="ml-{.14rem}"
        />
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        {moduleSetting.config.type === 'frontend' ? (
          <CustomButton
            type="primary"
            width="1.3rem"
            onClick={() => {
              openLink('https://www.google.com');
            }}
          >
            Preview
          </CustomButton>
        ) : (
          <CustomButton
            type="primary"
            width="1.3rem"
            onClick={() => {
              setEditModalOpen(true);
            }}
          >
            Edit
          </CustomButton>
        )}

        <CustomButton
          type="stroke"
          width="1.3rem"
          className="ml-[.24rem]"
          onClick={() => {
            openLink('https://www.google.com');
          }}
        >
          Toturial
        </CustomButton>

        {moduleSetting.config.type !== 'frontend' && (
          <CustomButton
            type="stroke"
            width="1.3rem"
            className="ml-[.24rem]"
            onClick={async () => {
              await saveModuleToDb({
                ...moduleSetting,
                disabled: !moduleSetting.disabled,
              });
              onUpdate();
            }}
          >
            {moduleSetting.disabled ? 'Turn on' : 'Turn off'}
          </CustomButton>
        )}
      </div>

      <SetPointSystemModal
        eco={eco}
        userAddress={userAddress}
        open={editModalOpen && moduleSetting.config.type === 'point'}
        close={() => {
          setEditModalOpen(false);
        }}
        currentConfig={moduleSetting?.config?.config as PointModuleConfig}
        onSuccess={async (config: PointModuleConfig) => {
          const saved = await saveModuleToDb({
            ...moduleSetting,
            config: {
              type: 'point',
              config: config,
            },
          });
          setEditModalOpen(false);
          onUpdate();
        }}
      />

      <SetAiValidatorModal
        userAddress={userAddress}
        open={editModalOpen && moduleSetting.config.type === 'ai'}
        close={() => {
          setEditModalOpen(false);
        }}
        currentConfig={moduleSetting?.config?.config as AiValidatorModuleConfig}
        onSuccess={async (config: AiValidatorModuleConfig) => {
          const saved = await saveModuleToDb({
            ...moduleSetting,
            config: {
              type: 'ai',
              config: config,
            },
          });
          setEditModalOpen(false);
          onUpdate();
        }}
      />
    </div>
  );
};

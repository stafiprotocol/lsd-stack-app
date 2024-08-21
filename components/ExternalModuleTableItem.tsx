import classNames from 'classnames';
import Image from 'next/image';
import { getEcoTokenIcon, getModuleIcon, getModuleName } from 'utils/iconUtils';
import { CustomButton } from './common/CustomButton';
import {
  AiValidatorModuleConfig,
  ExternalModuleCardConfig,
  ModuleSetting,
  PointModuleConfig,
} from 'interfaces/module';
import { AppEco } from 'interfaces/common';
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
  lsdHistoryItem: LsdHistoryItem;
  config: ExternalModuleCardConfig;
}

export const ExternalModuleTableItem = (props: ModuleTableItemProps) => {
  const { index, config, eco, lsdHistoryItem } = props;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const userAddress = useUserAddress(eco);
  const [moduleSetting, setModuleSetting] = useState<ModuleSetting>();

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
          <Image src={getModuleIcon(config.type)} alt="logo" layout="fill" />
        </div>

        {config.title}
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1"></div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        <CustomButton
          type="external"
          width="1.3rem"
          className="mr-[.24rem]"
          onClick={() => {
            openLink(config.externalLink);
          }}
        >
          Open External
        </CustomButton>

        <CustomButton
          type="stroke"
          width="1.3rem"
          className=""
          onClick={() => {
            openLink(config.tutorialLink);
          }}
        >
          Tutorial
        </CustomButton>
      </div>
    </div>
  );
};

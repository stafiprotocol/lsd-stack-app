import classNames from 'classnames';
import Image from 'next/image';
import { getEcoTokenIcon, getModuleIcon } from 'utils/iconUtils';
import { CustomButton } from './common/CustomButton';
import { useEffect } from 'react';
import { useModuleList } from 'hooks/useModuleList';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { AppEco } from 'interfaces/common';
import { ModuleTableItem } from './ModuleTableItem';
import { EmptyContent } from './common/EmptyContent';
import { useUserAddress } from 'hooks/useUserAddress';

interface Props {
  eco: AppEco;
}

export const ProfileModulePage = (props: Props) => {
  const { eco } = props;
  const userAddress = useUserAddress(eco);
  const { moduleList, update } = useModuleList(userAddress, eco);

  return (
    <div>
      <div className="mt-[.24rem] bg-color-bg2 border-[0.01rem] border-color-border1 rounded-[.3rem]">
        <div
          className={classNames(
            'h-[.7rem] grid items-center font-[500]',
            moduleList.length > 0 ? '' : 'invisible'
          )}
          style={{
            gridTemplateColumns: '22% 22% 10% 46%',
          }}
        >
          <div className="pl-[.5rem] flex items-center justify-start text-[.16rem] text-color-text2">
            Token Name
          </div>

          <div className="flex items-center justify-start text-[.16rem] text-color-text2">
            Module Name
          </div>

          <div className="flex items-center justify-start text-[.16rem] text-color-text2">
            Status
          </div>

          <div className="flex items-center justify-start text-[.16rem] text-color-text2"></div>
        </div>

        {moduleList.length === 0 ? (
          <div className="mt-[.32rem] mb-[1rem]">
            <EmptyContent />
          </div>
        ) : (
          moduleList.map((item, index) => (
            <ModuleTableItem
              key={index}
              index={index}
              eco={eco}
              moduleSetting={item}
              onUpdate={() => {
                update();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

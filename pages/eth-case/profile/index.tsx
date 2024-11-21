import classNames from 'classnames';
import { EthDashboard } from 'components/demo/EthDashboard';
import { ProfileModulePage } from 'components/demo/ProfileModulePage';
import { useAppDispatch } from 'hooks/common';
import { AppEco } from 'interfaces/common';
import { useState } from 'react';

const EthProfilePage = () => {
  const dispatch = useAppDispatch();

  const [tab, setTab] = useState<'stack' | 'module'>('stack');

  return (
    <div>
      <div className="bg-bgPage pt-[.24rem] pb-[1.05rem]">
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
          <div className="inline-flex h-[.42rem] px-[.04rem] py-[.04rem] text-[.16rem] items-stretch rounded-[.4rem] border border-[#E8EFFD] bg-[#FFFFFF80]">
            <div
              className={classNames(
                ' w-[1.12rem] rounded-[.4rem] flex items-center justify-center cursor-pointer',
                tab === 'stack' ? 'text-white bg-text1' : 'text-text1'
              )}
              onClick={() => {
                setTab('stack');
              }}
            >
              Stack
            </div>

            <div
              className={classNames(
                'w-[1.12rem] rounded-[.4rem] flex items-center justify-center cursor-pointer',
                tab === 'module' ? 'text-white bg-text1' : 'text-text1'
              )}
              onClick={() => {
                setTab('module');
              }}
            >
              Module
            </div>
          </div>

          {tab === 'stack' ? (
            <EthDashboard />
          ) : (
            <ProfileModulePage eco={AppEco.Eth} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EthProfilePage;

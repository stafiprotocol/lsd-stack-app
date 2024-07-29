import classNames from 'classnames';
import { useModuleList } from 'hooks/useModuleList';
import { useUserAddress } from 'hooks/useUserAddress';
import { AppEco, EvmLsdTokenConfig } from 'interfaces/common';
import { ModuleTableItem } from './ModuleTableItem';
import { EmptyContent } from './common/EmptyContent';
import { bindTrigger } from 'material-ui-popup-state';
import others from 'public/images/tokens/others.svg';
import { bindPopover, usePopupState } from 'material-ui-popup-state/hooks';
import ArrowDownImg from 'public/images/arrow_down_gray.svg';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { evmLsdTokens } from 'config/evm';
import { Icomoon } from './icon/Icomoon';
import { Popover } from '@mui/material';
import { openLink } from 'utils/commonUtils';

interface Props {
  eco: AppEco;
}

export const ProfileModulePage = (props: Props) => {
  const { eco } = props;
  const userAddress = useUserAddress(eco);
  const [evmLsdTokenConfig, setEvmLsdTokenConfig] =
    useState<EvmLsdTokenConfig>();
  const { lsdHistoryList } = useModuleList(eco, evmLsdTokenConfig);

  useEffect(() => {
    if (evmLsdTokens.length > 0) {
      setEvmLsdTokenConfig(evmLsdTokens[0]);
    }
  }, []);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'token',
  });

  return (
    <div>
      {eco === AppEco.Evm && (
        <div
          className="relative w-[3.2rem] mt-[.24rem] border border-[#6C86AD4D] rounded-[.2rem] text-[.14rem] text-text1 flex justify-center items-center text-center h-[.4rem] cursor-pointer"
          {...bindTrigger(popupState)}
        >
          {evmLsdTokenConfig?.symbol}

          <div
            className={classNames(
              'absolute w-[.12rem] h-[.12rem] right-[.22rem] top-[.13rem]',
              popupState.isOpen ? 'rotate-180' : ''
            )}
          >
            <Image src={ArrowDownImg} fill alt="arrow" />
          </div>
        </div>
      )}

      <div className="mt-[.24rem] bg-color-bg2 border-[0.01rem] border-color-border1 rounded-[.3rem]">
        <div
          className={classNames(
            'h-[.7rem] grid items-center font-[500]',
            lsdHistoryList.length > 0 ? '' : 'invisible'
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

        {lsdHistoryList.length === 0 ? (
          <div className="mt-[.32rem] mb-[1rem]">
            <EmptyContent />
          </div>
        ) : (
          lsdHistoryList.map((item, index) => (
            <div key={index}>
              {eco === AppEco.Cosmos && (
                <ModuleTableItem
                  type="ai"
                  index={3 * index}
                  lsdHistoryItem={item}
                  eco={eco}
                />
              )}

              {eco !== AppEco.Cosmos && (
                <ModuleTableItem
                  type="point"
                  index={3 * index}
                  lsdHistoryItem={item}
                  eco={eco}
                />
              )}

              <ModuleTableItem
                type="frontend"
                index={3 * index + 1}
                lsdHistoryItem={item}
                eco={eco}
              />
            </div>
          ))
        )}
      </div>

      <Popover
        {...bindPopover(popupState)}
        elevation={0}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          marginTop: '.12rem',
          '& .MuiPopover-paper': {
            background: '#FFFFFF',
            borderRadius: '.3rem',
            border: 'solid 1px #FFFFFF80',
            width: '3.2rem',
            paddingLeft: '.16rem',
            paddingRight: '.16rem',
          },
          '& .MuiTypography-root': {},
          '& .MuiBox-root': {},
        }}
      >
        {evmLsdTokens.map((lsdTokenConfig, index) => (
          <div key={index}>
            <div
              key={index}
              className="h-[.58rem] flex items-center justify-between cursor-pointer"
              onClick={() => {
                popupState.close();
                setEvmLsdTokenConfig(lsdTokenConfig);
              }}
            >
              <div className="flex items-center">
                <div className="ml-[.16rem] w-[.28rem] h-[.28rem] relative">
                  <Image src={lsdTokenConfig.icon} alt="logo" layout="fill" />
                </div>

                <div className="ml-[.12rem] text-[.16rem]">
                  {lsdTokenConfig.symbol}
                </div>
              </div>

              <div className="mr-[.3rem]">
                {lsdTokenConfig.symbol === evmLsdTokenConfig?.symbol ? (
                  <Icomoon
                    icon="checked-circle"
                    size=".18rem"
                    color="#5A5DE0"
                  />
                ) : (
                  <div className="w-[.18rem] h-[.18rem] rounded-full border-solid border-[1px] border-color-border3" />
                )}
              </div>
            </div>

            <div className="bg-[#E8EFFD] h-[1px] mx-[.3rem]" />
          </div>
        ))}

        <div className="h-[.58rem] flex items-center justify-between">
          <div className="flex items-center">
            <div className="ml-[.16rem] w-[.28rem] h-[.28rem] relative">
              <Image src={others} alt="logo" layout="fill" />
            </div>

            <div className="ml-[.16rem] text-[.16rem]">Others</div>
          </div>

          <div
            className="mr-[.3rem] text-[.16rem] text-[#5A5DE0] cursor-pointer"
            onClick={() => {
              popupState.close();
              openLink('https://discord.com/invite/jB77etn');
            }}
          >
            Contact Us
          </div>
        </div>
      </Popover>
    </div>
  );
};

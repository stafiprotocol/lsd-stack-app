import classNames from 'classnames';
import { EthDashboard } from 'components/EthDashboard';
import { EvmDashboard } from 'components/EvmDashboard';
import { CustomButton } from 'components/common/CustomButton';
import { getDocHost } from 'config/common';
import { getEthereumChainId } from 'config/eth/env';
import { useAppDispatch } from 'hooks/common';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { AppEco, EvmLsdTokenConfig } from 'interfaces/common';
import others from 'public/images/tokens/others.svg';
import { bindTrigger } from 'material-ui-popup-state';
import { bindPopover, usePopupState } from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import Link from 'next/link';
import empty from 'public/images/empty_bird.svg';
import { useEffect, useState } from 'react';
import { useConnect } from 'wagmi';
import ArrowDownImg from 'public/images/arrow_down_gray.svg';
import { evmLsdTokens } from 'config/evm';
import { Popover } from '@mui/material';
import { Icomoon } from 'components/icon/Icomoon';
import { getInjectedConnector, openLink } from 'utils/commonUtils';
import { ProfileModulePage } from 'components/ProfileModulePage';
import { UlstDashboard } from 'components/ulst/UlstDashboard';
import { monConfig } from 'config/mon';

const EvmProfilePage = () => {
  const dispatch = useAppDispatch();

  const { metaMaskAccount } = useWalletAccount();

  const { connectors, connectAsync } = useConnect();

  const [tab, setTab] = useState<'stack' | 'module'>('stack');

  const clickWallet = async () => {
    const metamaskConnector = getInjectedConnector(connectors);
    if (!metamaskConnector) {
      return;
    }
    try {
      await connectAsync({
        connector: metamaskConnector,
        chainId: monConfig.chainId,
      });
    } catch (err: any) {
      if (err.code === 4001) {
      } else {
        console.error(err);
      }
    }
  };

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

          {!metaMaskAccount ? (
            <div className="flex flex-col items-center">
              <div
                className="relative"
                style={{
                  width: '.4rem',
                  height: '.4rem',
                }}
              >
                <Image src={empty} alt="empty" layout="fill" />
              </div>

              <div className="mt-[.16rem] text-[.14rem] text-color-text2">
                Please connect your wallet to view your LSD deploy history
              </div>

              <div className="mt-[.32rem] flex items-center">
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    clickWallet();
                  }}
                >
                  <CustomButton
                    type="primary"
                    width="1.62rem"
                    className="opacity-50"
                  ></CustomButton>

                  <div className="text-[.16rem] text-text1 absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center">
                    Connect Wallet
                  </div>
                </div>

                <Link href={getDocHost()} target="_blank">
                  <CustomButton
                    type="stroke"
                    width="1.62rem"
                    className="ml-[.32rem]"
                  >
                    View Doc
                  </CustomButton>
                </Link>
              </div>
            </div>
          ) : tab === 'stack' ? (
            <DashboardUI />
          ) : (
            <ProfileModulePage eco={AppEco.Mon} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EvmProfilePage;

const DashboardUI = () => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'token',
  });

  return (
    <div>
      <UlstDashboard />

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

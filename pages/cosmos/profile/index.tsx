import classNames from 'classnames';
import { NeutronDashboard } from 'components/NeutronDashboard';
import { ProfileModulePage } from 'components/ProfileModulePage';
import { CustomButton } from 'components/common/CustomButton';
import { getDocHost } from 'config/common';
import { neutronChainConfig } from 'config/cosmos/chain';
import { useAppDispatch } from 'hooks/common';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
import { AppEco } from 'interfaces/common';
import { usePopupState } from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import Link from 'next/link';
import empty from 'public/images/empty_bird.svg';
import { useState } from 'react';
import { connectKeplrAccount } from 'redux/reducers/WalletSlice';

const EvmProfilePage = () => {
  const dispatch = useAppDispatch();

  const neutronChainAccount = useCosmosChainAccount(neutronChainConfig.chainId);

  const [tab, setTab] = useState<'stack' | 'module'>('stack');

  const clickWallet = async () => {
    dispatch(connectKeplrAccount([neutronChainConfig]));
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

          {!neutronChainAccount?.bech32Address ? (
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
                <div className="relative cursor-pointer" onClick={clickWallet}>
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
            <ProfileModulePage eco={AppEco.Cosmos} />
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
      <NeutronDashboard />
      {/* <div
        className="relative w-[3.2rem] mt-[.24rem] border border-[#6C86AD4D] rounded-[.2rem] text-[.14rem] text-text1 flex justify-center items-center text-center h-[.4rem] cursor-pointer"
        {...bindTrigger(popupState)}
      >
        {selectedLsdToken?.symbol}

        <div
          className={classNames(
            'absolute w-[.12rem] h-[.12rem] right-[.22rem] top-[.13rem]',
            popupState.isOpen ? 'rotate-180' : ''
          )}
        >
          <Image src={ArrowDownImg} fill alt="arrow" />
        </div>
      </div> */}

      {/* {selectedLsdToken && <EvmDashboard lsdTokenConfig={selectedLsdToken} />} */}

      {/* <Popover
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
                setSelectedLsdToken(lsdTokenConfig);
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
                {lsdTokenConfig.symbol === selectedLsdToken?.symbol ? (
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
      </Popover> */}
    </div>
  );
};

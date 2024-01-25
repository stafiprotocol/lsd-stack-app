import { Popover } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useWalletAccount } from 'hooks/useWalletAccount';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import defaultAvatar from 'public/images/default_avatar.png';
import ethereumLogo from 'public/images/ethereum.png';
import { connectMetaMask, disconnectWallet } from 'redux/reducers/WalletSlice';
import { RootState } from 'redux/store';
import { getShortAddress } from 'utils/stringUtils';
import { getEthereumChainId, getEthereumChainInfo } from 'config/env';
import LogoTextImg from 'public/images/logo_text.svg';
import LogoLabelBgImg from 'public/images/logo_label_bg.svg';
import { CreationStep } from 'components/common/CreationStep';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import BackImg from 'public/images/back.svg';
import { setBackRoute, setCreationStepInfo } from 'redux/reducers/AppSlice';
import { STANDARD_CREATION_STEPS } from 'constants/common';

const Navbar = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const { metaMaskAccount } = useWalletAccount();

  const { creationStepInfo } = useAppSelector((state) => state.app);

  const backToHome = () => {
    dispatch(setBackRoute(''));
    dispatch(
      setCreationStepInfo({
        steps: STANDARD_CREATION_STEPS,
        activedIndex: 0,
      })
    );
    router.replace('/');
  };

  return (
    <div>
      <div className="bg-color-bgPage py-[.36rem] flex items-center justify-center">
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto flex items-center justify-between relative">
          <div className="flex items-center gap-[.1rem]">
            <div className="relative w-[.82rem] h-[.2rem]">
              <Image src={LogoTextImg} alt="StaFi" layout="fill" />
            </div>
            <div className="w-[.45rem] h-[.2rem] relative">
              <div className="text-[.12rem] font-[700] leading-[.18rem] z-10 absolute top-0 left-0 w-full h-full text-white text-center flex items-center justify-center">
                LLAAS
              </div>
              <div className="absolute w-[.45rem] h-[.2rem] top-0 left-0">
                <Image src={LogoLabelBgImg} alt="LLAAS" layout="fill" />
              </div>
            </div>
          </div>
          <div className={classNames('flex items-center')}>
            <div className={classNames('ml-[.16rem]')}>
              {metaMaskAccount ? <UserInfo /> : <ConnectButton />}
            </div>
          </div>
        </div>
      </div>

      {(router.pathname !== '/' || creationStepInfo.activedIndex > 0) && (
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto mb-[.32rem]">
          <div
            className="flex w-[.88rem] h-[.4rem] items-center justify-center gap-[.08rem] bg-bg2 rounded-[.1rem] cursor-pointer"
            onClick={backToHome}
          >
            <div className="relative w-[.13rem] h-[.12rem]">
              <Image src={BackImg} alt="back" layout="fill" />
            </div>
            <div className="text-[.16rem] leading-[.24rem] text-text1">
              Back
            </div>
          </div>
        </div>
      )}

      <div
        className={classNames('flex justify-center h-[1.86rem]')}
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) -20.69%, rgba(255, 255, 255, 0.5) 103.45%)',
          boxShadow: '0px 1px 0px #FFFFFF',
        }}
      >
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW flex flex-col">
          <div className="h-full w-smallContentW xl:w-contentW 2xl:w-largeContentW text-text2 text-[.14rem] leading-[.21rem]">
            <div>
              Welcome to StaFi LLAAS platform, all parameters shown are defaults
              (including some randomly generated addresses), which we recommend
              using for testing purposes. More information around parameter
              customization and guidance can be found in the{' '}
              <a
                href="https://d835jsgd5asjf.cloudfront.net/"
                target="_blank"
                className="underline text-text1"
              >
                documentation
              </a>
              .
            </div>

            <div className="mt-[.32rem]">
              <CreationStep
                steps={creationStepInfo.steps}
                activedIndex={creationStepInfo.activedIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserInfo = () => {
  const dispatch = useAppDispatch();
  const { metaMaskAccount } = useWalletAccount();

  const addressPopupState = usePopupState({
    variant: 'popover',
    popupId: 'address',
  });

  return (
    <div className="h-[.42rem] bg-color-bg2 rounded-[.6rem] flex items-stretch">
      <div
        className={classNames(
          'items-center pl-[.04rem] pr-[.12rem] rounded-l-[.6rem] cursor-pointer flex'
        )}
      >
        <div className="w-[.34rem] h-[.34rem] relative">
          <Image
            src={ethereumLogo}
            alt="logo"
            className="rounded-full  overflow-hidden"
            layout="fill"
          />
        </div>

        <div
          className={classNames('ml-[.08rem] text-[.16rem] text-color-text1')}
        >
          Ethereum
        </div>

        {/* <div className="ml-[.12rem]">
          <Icomoon icon="arrow-down" size=".1rem" color="#848B97" />
        </div> */}
      </div>

      <div
        className={classNames(
          'self-center h-[.22rem] w-[.01rem] bg-[#DEE6F7] dark:bg-[#6C86AD80] flex'
        )}
      />

      <div
        className={classNames(
          'cursor-pointer pr-[.04rem] flex items-center rounded-r-[.6rem] pl-[.12rem]',
          addressPopupState.isOpen ? 'bg-color-selected' : ''
        )}
        {...bindTrigger(addressPopupState)}
      >
        <Image
          src={defaultAvatar}
          alt="logo"
          className="w-[.34rem] h-[.34rem] rounded-full"
        />

        <div
          className={classNames(
            'mx-[.12rem] text-[.16rem]',
            addressPopupState.isOpen ? 'text-text1 ' : 'text-color-text1'
          )}
        >
          {getShortAddress(metaMaskAccount, 5)}
        </div>
      </div>

      {/* Address Menu */}
      <Popover
        {...bindPopover(addressPopupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        elevation={0}
        sx={{
          marginTop: '.15rem',
          '& .MuiPopover-paper': {
            background: '#ffffff80',
            border: '0.01rem solid #FFFFFF',
            backdropFilter: 'blur(.4rem)',
            borderRadius: '.3rem',
          },
          '& .MuiTypography-root': {
            padding: '0px',
          },
          '& .MuiBox-root': {
            padding: '0px',
          },
        }}
      >
        <div className={classNames('p-[.16rem] w-[2rem]')}>
          <div
            className="cursor-pointer flex items-center justify-between"
            onClick={() => {
              navigator.clipboard.writeText(metaMaskAccount || '').then(() => {
                addressPopupState.close();
              });
            }}
          >
            <div className="flex items-center">
              <div className="ml-[.12rem] text-color-text1 text-[.16rem]">
                Copy Address
              </div>
            </div>
          </div>

          <div className="my-[.16rem] h-[0.01rem] bg-color-divider1" />

          <div
            className="cursor-pointer flex items-center justify-between"
            onClick={() => {
              addressPopupState.close();
              dispatch(disconnectWallet());
            }}
          >
            <div className="ml-[.12rem] text-color-text1 text-[.16rem]">
              Disconnect
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
};

const ConnectButton = () => {
  const dispatch = useAppDispatch();

  const clickConnectWallet = () => {
    dispatch(connectMetaMask(getEthereumChainInfo()));
  };

  return (
    <CustomButton
      type="small"
      height=".42rem"
      onClick={() => {
        clickConnectWallet();
      }}
      border="none"
      // textColor={darkMode ? "#E8EFFD" : ""}
    >
      Connect Wallet
    </CustomButton>
  );
};

export default Navbar;

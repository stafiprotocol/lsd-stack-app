import { Popover } from '@mui/material';
import classNames from 'classnames';
import { EcoSelectorBtn } from 'components/eco/EcoSelectorBtn';
import { robotoBold, robotoSemiBold } from 'config/font';
import {
  bindHover,
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import LogoImg from 'public/images/logo_text.svg';
import RelayTypeImg from 'public/images/relay_type.png';
import EcoEthImg from 'public/images/eco/eth.png';
import EcoCosmosImg from 'public/images/eco/cosmos.svg';
import arrowTrImg from 'public/images/arrow_tr.svg';
import ethCaseImg from 'public/images/case/eth.png';
import cosmosCaseImg from 'public/images/case/cosmos.png';
import moveCaseImg from 'public/images/case/move.png';
import lrtCaseImg from 'public/images/case/lrt.png';
import solanaCaseImg from 'public/images/case/solana.png';
import polkadotCaseImg from 'public/images/case/polkadot.png';
import EcoLrtImg from 'public/images/eco/lrt.png';
import EcoEvmImg from 'public/images/eco/evm.png';
import EcoSelectedImg from 'public/images/eco/selected.svg';
import EcoUnselectedImg from 'public/images/eco/unselected.svg';
import { AppEco } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { RootState } from 'redux/store';
import { openLink } from 'utils/commonUtils';
import { getDocHost } from 'config/common';
import { useEffect } from 'react';
import { setAppEco } from 'redux/reducers/AppSlice';
import { LsdCaseCard } from 'components/common/LsdCaseCard';
import commonStyles from 'styles/Common.module.scss';
import {
  getCosmosStackAppUrl,
  getEthStackAppUrl,
  getLrtCaseUrl,
} from 'config/eth/env';
import Link from 'next/link';

const HomePage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAppEco(null));
  }, [dispatch]);

  return (
    <div className="relative bg-blue h-screen flex flex-col ">
      <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
        <LogoBar />
      </div>

      <div className="flex-1 bg-blue flex flex-col justify-center pb-[.6rem]">
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto ">
          <div className="flex gap-[.3rem] pt-[.67rem]">
            <div>
              <div
                className={classNames(
                  robotoBold.className,
                  'text-[.64rem] leading-[.75rem] uppercase w-[4.25rem] text-black'
                )}
              >
                welcome to
                <br />
                stafi lsaas
              </div>

              <div className="text-[.16rem] leading-normal text-black capitalize mt-[.28rem] w-[3.8rem]">
                Please Choose the Ecosystem of your LST/LRT before Deploying
                your own protocol
              </div>

              <div className="mt-[.68rem]">
                <EcoSelector />
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] ml-[1.4rem] text-text1 cursor-pointer',
                  robotoSemiBold.className
                )}
                onClick={() => {
                  openLink(`${getDocHost()}`);
                }}
              >
                Learn More
              </div>
            </div>

            {/* <div className="relative w-[7.03rem] h-[4.8rem] ml-[.2rem]">
            <Image src={RelayTypeImg} fill alt="lsaas" />
          </div> */}
            <div
              className={classNames(
                'relative ml-[.2rem] overflow-x-auto ',
                commonStyles['hide-scrollbar']
              )}
            >
              <div className="flex">
                <LsdCaseCard
                  text="ETH LST"
                  icon={ethCaseImg}
                  url={getEthStackAppUrl()}
                />

                <LsdCaseCard
                  text="COSMOS LST"
                  icon={cosmosCaseImg}
                  url={getCosmosStackAppUrl()}
                  className="ml-[.12rem]"
                />

                <LsdCaseCard
                  text="MOVE LST"
                  icon={moveCaseImg}
                  isComing
                  className="ml-[.12rem]"
                />
              </div>

              <div className="flex mt-[.12rem]">
                <LsdCaseCard
                  text="Eigenlayer LRT"
                  icon={lrtCaseImg}
                  url={getLrtCaseUrl()}
                />

                <LsdCaseCard
                  text="Karak LRT Beta"
                  icon={polkadotCaseImg}
                  isComing
                  isKarak
                  className="ml-[.12rem]"
                />

                <LsdCaseCard
                  text="Solana LST"
                  icon={solanaCaseImg}
                  isComing
                  className="ml-[.12rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

const LogoBar = () => {
  const ecosystemPopoverState = usePopupState({
    variant: 'popover',
    popupId: 'address',
  });

  const governancePopoverState = usePopupState({
    variant: 'popover',
    popupId: 'address',
  });

  const resourcePopoverState = usePopupState({
    variant: 'popover',
    popupId: 'address',
  });

  return (
    <div className=" pt-[.47rem] flex items-center gap-[.1rem]">
      <div className="relative w-[.82rem] h-[.2rem]  ">
        <Image src={LogoImg} fill alt="StaFi" />
      </div>

      <div
        className={classNames(
          robotoBold.className,
          'bg-black rounded-[.05rem] text-white w-[.45rem] h-[.2rem] flex justify-center items-center text-center text-[.12rem] tracking-tight'
        )}
      >
        LSAAS
      </div>

      <Link href="https://www.stafi.io/" target="_blank">
        <div className="ml-[1.85rem] text-text1 cursor-pointer text-[.16rem] hover:opacity-70">
          StaFi 2.0
        </div>
      </Link>

      <div
        className="ml-[.56rem] text-text1 text-[.16rem] hover:opacity-70 cursor-pointer"
        {...bindHover(ecosystemPopoverState)}
      >
        Ecosystem
      </div>

      <div
        className="ml-[.56rem] text-text1 cursor-pointer text-[.16rem] hover:opacity-70 "
        {...bindHover(governancePopoverState)}
      >
        Governance
      </div>

      <div
        className="ml-[.56rem] text-text1 cursor-pointer text-[.16rem] hover:opacity-70"
        {...bindHover(resourcePopoverState)}
      >
        Resources
      </div>

      <Popover
        {...bindPopover(ecosystemPopoverState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        elevation={0}
        sx={{
          marginTop: '.15rem',
          '& .MuiPopover-paper': {
            background: '#000000',
            border: '0.01rem solid #000000',
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
        <div
          className={classNames(
            'p-[.16rem] w-[1.3rem] flex flex-col items-center'
          )}
        >
          <Link href="https://app.stafi.io/gallery/all/" target="_blank">
            <div className="  cursor-pointer text-text1Dark hover:opacity-70">
              rToken APP
            </div>
          </Link>
        </div>
      </Popover>

      <Popover
        {...bindPopover(governancePopoverState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        elevation={0}
        sx={{
          marginTop: '.15rem',
          '& .MuiPopover-paper': {
            background: '#000000',
            border: '0.01rem solid #000000',
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
        <div
          className={classNames(
            'p-[.16rem] w-[1.3rem] flex flex-col items-center'
          )}
        >
          <Link href="https://classic.stafi.io/dao/" target="_blank">
            <div className="  cursor-pointer text-text1Dark hover:opacity-70">
              DAO
            </div>
          </Link>

          <Link href="https://docs.stafi.io/fistoken/" target="_blank">
            <div className="mt-[.32rem] cursor-pointer text-text1Dark hover:opacity-70">
              FIS
            </div>
          </Link>

          <Link href="https://classic.stafi.io/treasury/" target="_blank">
            <div className="mt-[.32rem] cursor-pointer text-text1Dark hover:opacity-70">
              Treasury
            </div>
          </Link>

          <Link href="https://classic.stafi.io/rlaunchpad/" target="_blank">
            <div className="mt-[.32rem] cursor-pointer text-text1Dark hover:opacity-70">
              rLaunchpad
            </div>
          </Link>
        </div>
      </Popover>

      <Popover
        {...bindPopover(resourcePopoverState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        elevation={0}
        sx={{
          marginTop: '.15rem',
          '& .MuiPopover-paper': {
            background: '#000000',
            border: '0.01rem solid #000000',
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
        <div
          className={classNames(
            'p-[.16rem] w-[1.3rem] flex flex-col items-center'
          )}
        >
          <Link href="https://docs.stafi.io/" target="_blank">
            <div className="cursor-pointer text-text1Dark hover:opacity-70">
              Docs
            </div>
          </Link>

          {/* <Link href="https://www.stafi.io/campaign/" target="_blank">
            <div className="mt-[.32rem] cursor-pointer text-text1Dark hover:opacity-70">
              Campaigns
            </div>
          </Link> */}

          <Link href="https://github.com/stafiprotocol" target="_blank">
            <div className="mt-[.32rem] cursor-pointer text-text1Dark hover:opacity-70">
              Github
            </div>
          </Link>
        </div>
      </Popover>
    </div>
  );
};

const EcoSelector = () => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'eco',
  });

  return (
    <div>
      <div {...bindTrigger(popupState)}>
        <EcoSelectorBtn active={popupState.isOpen} />
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
            background: '#222C3C',
            borderRadius: '.3rem',
            width: '3.68rem',
            paddingLeft: '.16rem',
            paddingRight: '.16rem',
          },
          '& .MuiTypography-root': {},
          '& .MuiBox-root': {},
        }}
      >
        {[AppEco.Eth, AppEco.Lrt, AppEco.Evm, AppEco.Cosmos].map((eco) => (
          <div key={eco}>
            <EcoItem
              eco={eco}
              onClosePopup={() => {
                popupState.close();
              }}
            />

            {eco !== AppEco.Others && (
              <div className="bg-[#E8EFFD0D] h-[.01rem]" />
            )}
          </div>
        ))}
      </Popover>
    </div>
  );
};

interface EcoItemProps {
  eco: AppEco;
  onClosePopup: () => void;
}

const EcoItem = ({ eco, onClosePopup }: EcoItemProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { appEco } = useAppSelector((state: RootState) => {
    return {
      appEco: state.app.appEco,
    };
  });

  return (
    <div
      className="flex items-center py-[.14rem] cursor-pointer"
      onClick={() => {
        onClosePopup();
        dispatch(setAppEco(eco));
        setTimeout(() => {
          router.push(eco.toLowerCase());
        }, 100);
      }}
    >
      <div className="relative w-[.28rem] h-[.28rem]">
        <Image
          src={
            eco === AppEco.Cosmos
              ? EcoCosmosImg
              : eco === AppEco.Lrt
              ? EcoLrtImg
              : eco === AppEco.Evm
              ? EcoEvmImg
              : EcoEthImg
          }
          fill
          alt="eth"
        />
      </div>

      <div className="ml-[.12rem] text-[.16rem] text-white">
        {eco === AppEco.Lrt ? 'Eigenlayer LRT' : eco}
      </div>

      {appEco === eco ? (
        <div className="relative w-[.18rem] h-[.18rem] ml-auto mr-[.05rem]">
          <Image src={EcoSelectedImg} fill alt="check" />
        </div>
      ) : (
        <div className="relative w-[.18rem] h-[.18rem] ml-auto mr-[.05rem]">
          <Image src={EcoUnselectedImg} fill alt="check" />
        </div>
      )}
    </div>
  );
};

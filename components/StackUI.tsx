import { Popover } from '@mui/material';
import classNames from 'classnames';
import { LsdCaseCardV2 } from 'components/common/LsdCaseCardV2';
import { EcoSelectorBtn } from 'components/eco/EcoSelectorBtn';
import { robotoBold, robotoSemiBold } from 'config/font';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { AppEco } from 'interfaces/common';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import EcoCosmosImg from 'public/images/eco/cosmos.svg';
import EcoEthImg from 'public/images/eco/eth.png';
import EcoEvmImg from 'public/images/eco/evm.png';
import EcoLrtImg from 'public/images/eco/lrt.png';
import EcoSelectedImg from 'public/images/eco/selected.svg';
import EcoSolanaImg from 'public/images/eco/solana.png';
import EcoUnselectedImg from 'public/images/eco/unselected.svg';
import homeVectorImg from 'public/images/home_vector.png';
import atomLstImg from 'public/images/lst/atom.svg';
import customLstImg from 'public/images/lst/custom.svg';
import dotLstImg from 'public/images/lst/dot.svg';
import ethLstImg from 'public/images/lst/eth.svg';
import moreLstImg from 'public/images/lst/more.svg';
import moveLstImg from 'public/images/lst/move.png';
import solLstImg from 'public/images/lst/sol.svg';
import { useState } from 'react';
import { setAppEco } from 'redux/reducers/AppSlice';
import { RootState } from 'redux/store';

export const StackUI = () => {
  const [showSelectEco, setShowSelectEco] = useState(false);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'eco',
  });

  return (
    <div className="flex-1 bg-blue flex flex-col justify-center pb-[.6rem]">
      <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto ">
        <div className="flex gap-[.3rem] pt-[.67rem] justify-center">
          <div>
            <div
              className={classNames(
                robotoBold.className,
                'text-[.64rem] leading-1 uppercase w-[4.4rem] text-black'
              )}
            >
              welcome to
              <br />
              stafi lsaas
            </div>

            <div className="text-[.16rem] leading-normal text-black capitalize mt-[.2rem] w-[3.8rem]">
              Please Choose the Ecosystem of your lsd before Deploying your own
              LSD protocol
            </div>

            <div className="mt-[.32rem] flex items-center">
              {showSelectEco ? (
                <EcoSelector popupState={popupState} />
              ) : (
                <div className="flex h-[.56rem] items-stretch rounded-[.56rem] border border-[#222C3C80] hover:border-[#222C3C] active:border-[#222C3C80]">
                  <div
                    className={classNames(
                      robotoSemiBold.className,
                      ' px-[.3rem] flex items-center cursor-pointer text-text1'
                    )}
                    onClick={() => {
                      setShowSelectEco(true);
                      // setTimeout(() => {
                      //   popupState.open();
                      // }, 1000);
                    }}
                  >
                    Try out now
                  </div>
                </div>
              )}

              {!showSelectEco && (
                <Link href="https://lsaas-docs.stafi.io" target="_blank">
                  <div
                    className={classNames(
                      robotoSemiBold.className,
                      'mx-[.3rem] flex items-center cursor-pointer text-text1'
                    )}
                  >
                    Learn More
                  </div>
                </Link>
              )}
            </div>

            {/* <div className="mt-[.68rem]">
                <EcoSelector />
              </div> */}

            {/* <div
                className={classNames(
                  'mt-[.24rem] ml-[1.4rem] text-text1 cursor-pointer',
                  robotoSemiBold.className
                )}
                onClick={() => {
                  openLink(`${getDocHost()}`);
                }}
              >
                Learn More
              </div> */}
          </div>

          <div className="mt-[-.45rem] relative w-[8rem] h-[4.4rem] ml-[.2rem]">
            <Image src={homeVectorImg} fill alt="lsaas" />
          </div>
        </div>

        <div className={classNames('relative ml-[.2rem] flex items-center')}>
          <LsdCaseCardV2 text="ETH LST" icon={ethLstImg} url={'/eth'} />

          <LsdCaseCardV2
            text="EVM LST"
            icon={ethLstImg}
            url={'/evm'}
            className="ml-[.32rem]"
          />

          <LsdCaseCardV2
            text="ATOM LST"
            icon={atomLstImg}
            url={'/cosmos'}
            className="ml-[.32rem]"
          />

          <LsdCaseCardV2
            text="SOL LST"
            icon={solLstImg}
            url={'/sol'}
            className="ml-[.32rem]"
          />

          <LsdCaseCardV2
            text="LRT"
            icon={dotLstImg}
            url={'/lrt'}
            className="ml-[.32rem]"
          />

          <LsdCaseCardV2
            text="MOVE LST"
            icon={moveLstImg}
            isComing
            isKarak
            className="ml-[.32rem]"
          />

          <LsdCaseCardV2
            text="CUSTOM"
            isBlank
            icon={customLstImg}
            url="https://lsaas-docs.stafi.io/docs/introduction/getstarted.html"
            className="ml-[.32rem]"
          />

          <LsdCaseCardV2
            text="MORE"
            isBlank
            icon={moreLstImg}
            url="https://lsaas-docs.stafi.io/docs/introduction/getstarted.html"
            className="ml-[.32rem]"
          />
        </div>
      </div>
    </div>
  );
};

const EcoSelector = (props: { popupState: any }) => {
  const { popupState } = props;

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
        {[AppEco.Eth, AppEco.Lrt, AppEco.Evm, AppEco.Cosmos, AppEco.Sol].map(
          (eco) => (
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
          )
        )}
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
              : eco === AppEco.Sol
              ? EcoSolanaImg
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

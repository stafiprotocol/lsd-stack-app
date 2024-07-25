import { Popover } from '@mui/material';
import classNames from 'classnames';
import { EcoSelectorBtn } from 'components/eco/EcoSelectorBtn';
import { getEthStackAppUrl } from 'config/eth/env';
import { robotoBold, robotoSemiBold } from 'config/font';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { AppEco } from 'interfaces/common';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import { useRouter } from 'next/router';
import EcoCosmosImg from 'public/images/eco/cosmos.svg';
import EcoEthImg from 'public/images/eco/eth.png';
import EcoEvmImg from 'public/images/eco/evm.png';
import EcoLrtImg from 'public/images/eco/lrt.png';
import EcoSelectedImg from 'public/images/eco/selected.svg';
import EcoUnselectedImg from 'public/images/eco/unselected.svg';
import { setAppEco } from 'redux/reducers/AppSlice';
import { RootState } from 'redux/store';
import { LsdCaseCard } from './common/LsdCaseCard';
import { useEffect, useState } from 'react';

export const ModularUI = () => {
  const [showSelectEco, setShowSelectEco] = useState(false);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'eco',
  });

  return (
    <div className="flex-1 bg-blue flex flex-col justify-center pb-[.6rem]">
      <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto ">
        <div className="flex gap-[.73rem] pt-[.67rem] justify-center">
          <div className={classNames('')}>
            <LsdCaseCard
              title="Validator Selection AI Agent"
              text="Functions including simulate result and set parameters"
              url={getEthStackAppUrl()}
            />

            <LsdCaseCard
              title="Point System"
              text="Point function, customized point emission rules"
              url={getEthStackAppUrl()}
              className="mt-[.16rem]"
            />

            <LsdCaseCard
              title="Frontend"
              text="Frontend preview and host tutorial"
              url={getEthStackAppUrl()}
              className="mt-[.16rem]"
            />
          </div>

          <div>
            <div
              className={classNames(
                robotoBold.className,
                'text-[.64rem] leading-1 uppercase w-[4.4rem] text-black'
              )}
            >
              Simplify
              <br />
              Customization
              <br />
              with RICH
              <br />
              Modules
            </div>

            <div className="h-[.35rem] rounded-[.14rem] bg-white w-[3.3rem] ml-[-0.15rem] mt-[-0.35rem]" />

            <div className="text-[.16rem] leading-normal text-black capitalize mt-[.2rem] w-[5.6rem]">
              LSaaS module ecosystem, enable to add-on feature that can
              facilitate the develop efficient of LSTs and LRTs when using
              LSaaS.
            </div>

            <div className="mt-[.32rem] flex items-center">
              {showSelectEco ? (
                <EcoSelector />
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

              <div
                className={classNames(
                  robotoSemiBold.className,
                  'mx-[.3rem] flex items-center cursor-pointer text-text1'
                )}
              >
                Learn More
              </div>
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
        </div>
      </div>
    </div>
  );
};

const EcoSelector = () => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'eco',
  });

  // useEffect(() => {
  //   popupState.open();
  // }, [popupState]);

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

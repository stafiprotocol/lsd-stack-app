import { Popover } from '@mui/material';
import classNames from 'classnames';
import { EcoSelectorBtn } from 'components/eco/EcoSelectorBtn';
import { robotoBold, robotoSemiBold } from 'config/font';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import LogoImg from 'public/images/logo_text.svg';
import RelayTypeImg from 'public/images/relay_type.png';
import EcoEthImg from 'public/images/eco/eth.svg';
import EcoCosmosImg from 'public/images/eco/cosmos.svg';
import EcoLrtImg from 'public/images/eco/lrt.svg';
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

const HomePage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAppEco(null));
  }, [dispatch]);

  return (
    <div className="relative bg-blue h-screen">
      <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto ">
        <LogoBar />

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
              Please Choose the Ecosystem of your lsd before Deploying your own
              LSD protocol
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

          <div className="relative w-[7.03rem] h-[4.8rem] ml-[.2rem]">
            <Image src={RelayTypeImg} fill alt="lsaas" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

const LogoBar = () => {
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
        {[AppEco.Eth, AppEco.Lrt, AppEco.Cosmos].map((eco) => (
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
        }, 1000);
      }}
    >
      <div className="relative w-[.28rem] h-[.28rem]">
        <Image
          src={
            eco === AppEco.Cosmos
              ? EcoCosmosImg
              : eco === AppEco.Lrt
              ? EcoLrtImg
              : EcoEthImg
          }
          fill
          alt="eth"
        />
      </div>

      <div className="ml-[.12rem] text-[.16rem] text-white">{eco}</div>

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

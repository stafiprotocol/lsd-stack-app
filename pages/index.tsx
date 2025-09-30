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
import logoImg from 'public/images/logo.svg';
import homeVectorImg from 'public/images/home_vector.png';
import EcoEthImg from 'public/images/eco/eth.png';
import EcoCosmosImg from 'public/images/eco/cosmos.svg';
import EcoTonImg from 'public/images/eco/ton.svg';
import arrowTrImg from 'public/images/arrow_tr.svg';
import ethCaseImg from 'public/images/case/eth.png';
import cosmosCaseImg from 'public/images/case/cosmos.png';
import moveCaseImg from 'public/images/case/move.png';
import lrtCaseImg from 'public/images/case/lrt.png';
import solanaCaseImg from 'public/images/case/solana.png';
import polkadotCaseImg from 'public/images/case/polkadot.png';
import EcoLrtImg from 'public/images/eco/lrt.png';
import EcoEvmImg from 'public/images/eco/evm.png';
import EcoSolanaImg from 'public/images/eco/solana.png';
import ethLstImg from 'public/images/lst/eth.svg';
import dotLstImg from 'public/images/lst/dot.svg';
import atomLstImg from 'public/images/lst/atom.svg';
import solLstImg from 'public/images/lst/sol.svg';
import moveLstImg from 'public/images/lst/move.png';
import moreLstImg from 'public/images/lst/more.svg';
import customLstImg from 'public/images/lst/custom.svg';
import EcoSelectedImg from 'public/images/eco/selected.svg';
import EcoUnselectedImg from 'public/images/eco/unselected.svg';
import { AppEco } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { RootState } from 'redux/store';
import { openLink } from 'utils/commonUtils';
import { getDocHost } from 'config/common';
import { useEffect, useState } from 'react';
import { setAppEco } from 'redux/reducers/AppSlice';
import { LsdCaseCard } from 'components/common/LsdCaseCard';
import commonStyles from 'styles/Common.module.scss';
import {
  getCosmosStackAppUrl,
  getEthStackAppUrl,
  getEvmCaseUrl,
  getLrtCaseUrl,
} from 'config/eth/env';
import Link from 'next/link';
import { LsdCaseCardV2 } from 'components/common/LsdCaseCardV2';
import { StackUI } from 'components/StackUI';
import { ModularUI } from 'components/ModularUI';
import { VaultUI } from 'components/VaultUI';

const HomePage = () => {
  const dispatch = useAppDispatch();

  const [tab, setTab] = useState<'stack' | 'modular' | 'vault'>('stack');

  useEffect(() => {
    dispatch(setAppEco(null));
  }, [dispatch]);

  return (
    <div className="relative bg-blue h-screen flex flex-col ">
      <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
        <div className="pt-[.47rem] flex items-center justify-center gap-[.1rem] relative">
          <div className="absolute left-0 w-[1.64rem] h-[.3rem]  ">
            <Image src={logoImg} fill alt="StaFi" />
          </div>

          <div className="flex h-[.4rem] items-stretch rounded-[.4rem] border border-[#222C3C80]">
            <div
              className={classNames(
                robotoSemiBold.className,
                ' px-[.3rem] rounded-[.4rem] flex items-center cursor-pointer',
                tab === 'stack' ? 'text-blue bg-bgPageDark' : 'text-text1'
              )}
              onClick={() => {
                setTab('stack');
              }}
            >
              Stack
            </div>

            <div
              className={classNames(
                robotoSemiBold.className,
                ' px-[.15rem] rounded-[.4rem] flex items-center cursor-pointer',
                tab === 'modular' ? 'text-blue bg-bgPageDark' : 'text-text1'
              )}
              onClick={() => {
                setTab('modular');
              }}
            >
              Modular
            </div>

            <div
              className={classNames(
                robotoSemiBold.className,
                ' px-[.3rem] rounded-[.4rem] flex items-center cursor-pointer',
                tab === 'vault' ? 'text-blue bg-bgPageDark' : 'text-text1'
              )}
              onClick={() => {
                setTab('vault');
              }}
            >
              Vault
            </div>
          </div>
        </div>
      </div>

      {tab === 'stack' && <StackUI />}

      {tab === 'modular' && <ModularUI />}

      {tab === 'vault' && <VaultUI />}
    </div>
  );
};

export default HomePage;

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
          let path = eco.toLowerCase();
          if (eco === AppEco.Sol) {
            path += '?net=mainnet';
          }
          router.push(path);
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
              : eco === AppEco.Ton
              ? EcoTonImg
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

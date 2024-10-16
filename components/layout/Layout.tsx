import { AppBar } from '@mui/material';
import classNames from 'classnames';
import { SubmitLoadingModal } from 'components/modal/SubmitLoadingModal';
import { roboto } from 'config/font';
import { useAppDispatch } from 'hooks/common';
import { useInit } from 'hooks/useInit';
import { AppEco, NavigationItem } from 'interfaces/common';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { setAppEco } from 'redux/reducers/AppSlice';
import {
  setMetaMaskAccount,
  setMetaMaskChainId,
} from 'redux/reducers/WalletSlice';
import { useAccount, useNetwork } from 'wagmi';

const Navbar = dynamic(() => import('./Navbar'), { ssr: false });

export const MyLayoutContext = React.createContext<{
  navigation: NavigationItem[] | undefined;
  setNavigation: any;
}>({
  navigation: undefined,
  setNavigation: undefined,
});

export const Layout = (props: React.PropsWithChildren) => {
  const router = useRouter();

  const dispatch = useAppDispatch();
  useInit();

  const { address } = useAccount();
  const { chain: wagmiChain } = useNetwork();

  const [navigation, setNavigation] = useState<NavigationItem[]>([]);

  useEffect(() => {
    dispatch(setMetaMaskAccount(address));
    dispatch(setMetaMaskChainId(wagmiChain?.id));
  }, [address, dispatch, wagmiChain?.id]);

  useEffect(() => {
    if (router.pathname === '/') {
      return;
    }
    if (router.pathname.includes('cosmos')) {
      dispatch(setAppEco(AppEco.Cosmos));
    } else if (router.pathname.includes('evm')) {
      dispatch(setAppEco(AppEco.Evm));
    } else if (router.pathname.includes('lrt')) {
      dispatch(setAppEco(AppEco.Lrt));
    } else if (router.pathname.includes('sol')) {
      dispatch(setAppEco(AppEco.Sol));
    } else if (router.pathname.includes('ton')) {
      dispatch(setAppEco(AppEco.Ton));
    } else {
      dispatch(setAppEco(AppEco.Eth));
    }
  }, [router, dispatch]);

  return (
    <MyLayoutContext.Provider
      value={{
        navigation,
        setNavigation,
      }}
    >
      <div className={classNames(roboto.className)}>
        <Head>
          <title>StaFi LSAAS</title>
          <meta name="description" content="" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        {router.pathname !== '/' && (
          <AppBar
            position="relative"
            color="transparent"
            elevation={0}
            // sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Navbar />
          </AppBar>
        )}

        <main className="flex flex-col items-center">
          <div className="w-full">{props.children}</div>
        </main>

        <SubmitLoadingModal />
      </div>
    </MyLayoutContext.Provider>
  );
};

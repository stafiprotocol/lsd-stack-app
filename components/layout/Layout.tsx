import React, { useEffect, useState } from 'react';
import { NavigationItem } from 'interfaces/common';
import Head from 'next/head';
import { AppBar } from '@mui/material';
import dynamic from 'next/dynamic';
import { useInit } from 'hooks/useInit';
import classNames from 'classnames';
import { roboto } from 'config/font';
import { SubmitLoadingModal } from 'components/modal/SubmitLoadingModal';
import { useAccount } from 'wagmi';
import { useAppDispatch } from 'hooks/common';
import {
  setMetaMaskAccount,
  setMetaMaskChainId,
} from 'redux/reducers/WalletSlice';
import { useRouter } from 'next/router';

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

  const { address, chainId } = useAccount();

  const [navigation, setNavigation] = useState<NavigationItem[]>([]);

  useEffect(() => {
    if (address) {
      dispatch(setMetaMaskAccount(address));
    }
    if (chainId) {
      dispatch(setMetaMaskChainId(chainId + ''));
    }
  }, [address, dispatch, chainId]);

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
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
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

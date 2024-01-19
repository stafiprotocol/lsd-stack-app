import React, { useState } from 'react';
import { NavigationItem } from 'interfaces/common';
import Head from 'next/head';
import { HideOnScroll } from 'components/common/HideOnScroll';
import { AppBar } from '@mui/material';
import dynamic from 'next/dynamic';
import { useInit } from 'hooks/useInit';
import classNames from 'classnames';
import { roboto } from 'config/font';
import { SubmitLoadingModal } from 'components/modal/SubmitLoadingModal';

const Navbar = dynamic(() => import('./Navbar'), { ssr: false });

export const MyLayoutContext = React.createContext<{
  navigation: NavigationItem[] | undefined;
  setNavigation: any;
}>({
  navigation: undefined,
  setNavigation: undefined,
});

export const Layout = (props: React.PropsWithChildren) => {
  useInit();

  const [navigation, setNavigation] = useState<NavigationItem[]>([]);

  return (
    <MyLayoutContext.Provider
      value={{
        navigation,
        setNavigation,
      }}
    >
      <div className={classNames(roboto.className)}>
        <Head>
          <title>StaFi LLAAS</title>
          <meta name="description" content="" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <HideOnScroll>
          <AppBar
            position="relative"
            color="transparent"
            elevation={0}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Navbar />
          </AppBar>
        </HideOnScroll>

        <main className="flex flex-col items-center">
          <div className="mb-[.2rem] w-full">{props.children}</div>
        </main>

        <SubmitLoadingModal />
      </div>
    </MyLayoutContext.Provider>
  );
};

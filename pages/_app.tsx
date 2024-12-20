import { Fade, ThemeProvider, styled } from '@mui/material';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from 'components/layout/Layout';
import { solanaRestEndpoint, solanaWsEndpoint } from 'config/sol';
import { wagmiConfig } from 'config/walletConnect';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';
import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from 'redux/store';
import 'styles/globals.css';
import { theme } from 'styles/material-ui-theme';
import { SnackbarUtilsConfigurator } from 'utils/snackbarUtils';
import { WagmiConfig } from 'wagmi';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';

const queryClient = new QueryClient();

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const resizeListener = () => {
    // 1rem:100px
    let designSize = 1512;
    let html = document.documentElement;
    let clientW = html.clientWidth;
    let htmlRem = (clientW * 100) / designSize;
    html.style.fontSize = Math.min(htmlRem, clientW > 1900 ? 130 : 100) + 'px';
  };

  useEffect(() => {
    window.addEventListener('resize', resizeListener);
    resizeListener();

    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  return (
    <Provider store={store}>
      <MyAppWrapper Component={Component} pageProps={pageProps} />
    </Provider>
  );
}

export default MyApp;

const MyAppWrapper = ({ Component, pageProps }: any) => {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page: any) => page);

  const [host, setHost] = useState(
    typeof window !== 'undefined' ? window.location.origin : ''
  );

  const StyledMaterialDesignContent = useMemo(() => {
    const successBg = '#E8EFFD';
    const successTextColor = '#222C3C';

    return styled(MaterialDesignContent)(() => ({
      '&.notistack-MuiContent-success': {
        backgroundColor: successBg,
        color: successTextColor,
        fontSize: '.16rem',
      },
      '&.notistack-MuiContent-error': {
        backgroundColor: 'rgba(255,82,196, 0.9) !important',
        color: '#ffffff',
        fontSize: '.16rem',
      },
      '&.notistack-MuiContent-warning': {
        backgroundColor: 'rgba(255, 204, 0, 0.9) !important',
        color: '#ffffff',
        fontSize: '.16rem',
      },
    }));
  }, []);

  // useEffect(() => {
  //   setHost(window.location.origin);
  //   console.log(window.location.origin);
  // }, []);

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        maxSnack={1}
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        TransitionComponent={Fade as React.ComponentType}
        Components={{
          success: StyledMaterialDesignContent,
          error: StyledMaterialDesignContent,
          warning: StyledMaterialDesignContent,
        }}
      >
        <WagmiConfig config={wagmiConfig}>
          <TonConnectUIProvider
            manifestUrl={`${host}/tonconnect-manifest.json`}
          >
            <QueryClientProvider client={queryClient}>
              <ConnectionProvider
                endpoint={solanaRestEndpoint}
                config={{
                  wsEndpoint: solanaWsEndpoint,
                }}
              >
                <WalletProvider wallets={[]} autoConnect>
                  <WalletModalProvider>
                    <SnackbarUtilsConfigurator />
                    <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
                  </WalletModalProvider>
                </WalletProvider>
              </ConnectionProvider>
            </QueryClientProvider>
          </TonConnectUIProvider>
        </WagmiConfig>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

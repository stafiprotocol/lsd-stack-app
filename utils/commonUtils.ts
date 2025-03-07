import { KEPLR_ERROR_REJECT } from 'constants/common';
import { Connector } from 'wagmi';

/**
 * open link in new tab
 * @param url link's url
 */
export function openLink(url: string | undefined | null) {
  if (!url) {
    return;
  }
  const otherWindow = window.open();
  if (otherWindow) {
    otherWindow.opener = null;
    otherWindow.location = url;
  }
}

export const isKeplrCancelError = (err: any) => {
  return (err as Error).message === KEPLR_ERROR_REJECT;
};

export const isKeplrInstalled = () => {
  return (window as any).getOfflineSignerAuto && (window as any).keplr;
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getInjectedConnector(connectors: Connector[]) {
  const injectedConnector = connectors.find((c) => c.id === 'injected');

  return injectedConnector;
}

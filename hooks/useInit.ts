import { useEffect } from 'react';
import { setCreationStepInfo, setUpdateFlag } from 'redux/reducers/AppSlice';
import {
  autoConnectKeplrChains,
  setMetaMaskDisconnected,
  updateCosmosTokenBalances,
} from 'redux/reducers/WalletSlice';
import {
  getStorage,
  STORAGE_KEY_DISCONNECT_METAMASK,
} from 'utils/storageUtils';
import { useAppDispatch, useAppSelector } from './common';
import { useInterval } from './useInterval';
import { usePathname } from 'next/navigation';
import {
  ETH_CUSTOMIZE_CREATION_STEPS,
  ETH_STANDARD_CREATION_STEPS,
} from 'constants/common';
import { initIndexDb } from 'utils/dbUtils';

declare const window: { ethereum: any };
declare const ethereum: any;

export function useInit() {
  const path = usePathname();

  const dispatch = useAppDispatch();
  const { backRoute } = useAppSelector((state) => state.app);

  useEffect(() => {
    initIndexDb();
  }, []);

  // useEffect(() => {
  //   if (!path) return;
  //   if (path === '/') {
  //     if (backRoute === 'tokenStandard') {
  //       dispatch(
  //         setCreationStepInfo({
  //           steps: ETH_CUSTOMIZE_CREATION_STEPS,
  //           activedIndex: 1,
  //         })
  //       );
  //     } else {
  //       dispatch(
  //         setCreationStepInfo({
  //           steps: ETH_STANDARD_CREATION_STEPS,
  //           activedIndex: 0,
  //         })
  //       );
  //     }
  //   } else if (path.startsWith('/standard')) {
  //     if (path.endsWith('review') || path.endsWith('review/')) {
  //       dispatch(
  //         setCreationStepInfo({
  //           steps: ETH_STANDARD_CREATION_STEPS,
  //           activedIndex: 2,
  //         })
  //       );
  //     } else {
  //       dispatch(
  //         setCreationStepInfo({
  //           steps: ETH_STANDARD_CREATION_STEPS,
  //           activedIndex: 1,
  //         })
  //       );
  //     }
  //   } else {
  //     if (path.endsWith('review') || path.endsWith('review/')) {
  //       dispatch(
  //         setCreationStepInfo({
  //           steps: ETH_CUSTOMIZE_CREATION_STEPS,
  //           activedIndex: 3,
  //         })
  //       );
  //     } else {
  //       dispatch(
  //         setCreationStepInfo({
  //           steps: ETH_CUSTOMIZE_CREATION_STEPS,
  //           activedIndex: 2,
  //         })
  //       );
  //     }
  //   }
  // }, [dispatch, path]);

  useEffect(() => {
    // Init local data.
    dispatch(
      setMetaMaskDisconnected(!!getStorage(STORAGE_KEY_DISCONNECT_METAMASK))
    );
  }, [dispatch]);

  // Keplr auto connect and user account switch logic.
  useEffect(() => {
    // Auto connect Keplr accounts
    dispatch(autoConnectKeplrChains());

    const onKeplrAccountChange = () => {
      dispatch(autoConnectKeplrChains());
    };

    // Keplr account change event.
    addEventListener('keplr_keystorechange', onKeplrAccountChange);

    return () => {
      removeEventListener('keplr_keystorechange', onKeplrAccountChange);
    };
  }, [dispatch]);

  // useInterval(() => {
  //   dispatch(setUpdateFlag(dayjs().unix()));
  // }, 6000); // 6s

  useInterval(() => {
    dispatch(updateCosmosTokenBalances());
  }, 6000);

  useEffect(() => {
    document.body.style.backgroundColor = '#E8EFFD';
  }, []);
}

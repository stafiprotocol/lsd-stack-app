import { useEffect } from 'react';
import { setCreationStepInfo, setUpdateFlag } from 'redux/reducers/AppSlice';
import { setMetaMaskDisconnected } from 'redux/reducers/WalletSlice';
import {
  getStorage,
  STORAGE_KEY_DISCONNECT_METAMASK,
} from 'utils/storageUtils';
import { useAppDispatch, useAppSelector } from './common';
import { useInterval } from './useInterval';
import { usePathname } from 'next/navigation';
import {
  CUSTOMIZE_CREATION_STEPS,
  STANDARD_CREATION_STEPS,
} from 'constants/common';

declare const window: { ethereum: any };
declare const ethereum: any;

export function useInit() {
  const path = usePathname();

  const dispatch = useAppDispatch();
  const { backRoute } = useAppSelector((state) => state.app);

  useEffect(() => {
    if (!path) return;
    if (path === '/') {
      if (backRoute === 'tokenStandard') {
        dispatch(
          setCreationStepInfo({
            steps: CUSTOMIZE_CREATION_STEPS,
            activedIndex: 1,
          })
        );
      } else {
        dispatch(
          setCreationStepInfo({
            steps: STANDARD_CREATION_STEPS,
            activedIndex: 0,
          })
        );
      }
    } else if (path.startsWith('/standard')) {
      if (path.endsWith('review') || path.endsWith('review/')) {
        dispatch(
          setCreationStepInfo({
            steps: STANDARD_CREATION_STEPS,
            activedIndex: 2,
          })
        );
      } else {
        dispatch(
          setCreationStepInfo({
            steps: STANDARD_CREATION_STEPS,
            activedIndex: 1,
          })
        );
      }
    } else {
      if (path.endsWith('review') || path.endsWith('review/')) {
        dispatch(
          setCreationStepInfo({
            steps: CUSTOMIZE_CREATION_STEPS,
            activedIndex: 3,
          })
        );
      } else {
        dispatch(
          setCreationStepInfo({
            steps: CUSTOMIZE_CREATION_STEPS,
            activedIndex: 2,
          })
        );
      }
    }
  }, [dispatch, path]);

  useEffect(() => {
    // Init local data.
    dispatch(
      setMetaMaskDisconnected(!!getStorage(STORAGE_KEY_DISCONNECT_METAMASK))
    );
  }, [dispatch]);

  // useInterval(() => {
  //   dispatch(setUpdateFlag(dayjs().unix()));
  // }, 6000); // 6s

  useEffect(() => {
    document.body.style.backgroundColor = '#E8EFFD';
  }, []);
}

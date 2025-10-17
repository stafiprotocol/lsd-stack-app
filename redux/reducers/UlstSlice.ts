import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CANCELLED_MESSAGE,
  CONNECTION_ERROR_MESSAGE,
  TRANSACTION_FAILED_MESSAGE,
} from 'constants/common';
import { AppThunk } from 'redux/store';
import snackbarUtil from 'utils/snackbarUtils';
import {
  fetchTransactionReceiptWithWeb3,
  getWeb3,
  isMetaMaskCancelError,
} from 'utils/web3Utils';
import { setSubmitLoadingParams } from './AppSlice';
import { ulstConfig } from 'config/ulst';

export interface LsdState {}

const initialState: LsdState = {};

export const lsdSlice = createSlice({
  name: 'ulst',
  initialState,
  reducers: {},
});

export const {} = lsdSlice.actions;

export default lsdSlice.reducer;

export const createUlstLsdNetwork =
  (
    writeAsync: any,
    lsdTokenName: string,
    lsdTokenSymbol: string,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    const { govInstantManagerAddress, govOracleAddress, stableCoins } =
      ulstConfig;
    dispatch(
      createLsdNetwork(
        writeAsync,
        [
          lsdTokenName,
          lsdTokenSymbol,
          govInstantManagerAddress,
          govOracleAddress,
          stableCoins.map((s) => s.address),
        ],
        cb
      )
    );
  };

const createLsdNetwork =
  (writeAsync: any, params: any[], cb?: (success: boolean) => void): AppThunk =>
  async (dispatch, getState) => {
    const metaMaskAccount = getState().wallet.metaMaskAccount;
    if (!metaMaskAccount || !window.ethereum) {
      snackbarUtil.error('Please connect MetaMask');
      return;
    }

    dispatch(
      setSubmitLoadingParams({
        status: 'loading',
        modalOpened: true,
        txHash: '',
      })
    );

    try {
      const result = await writeAsync({
        args: [...params],
        from: metaMaskAccount,
      });

      const web3 = getWeb3(ulstConfig.rpc);

      const withdrawTransactionReceipt = await fetchTransactionReceiptWithWeb3(
        web3,
        result.hash
      );

      if (withdrawTransactionReceipt?.status) {
        dispatch(
          setSubmitLoadingParams({
            status: 'success',
            modalOpened: true,
            txHash: withdrawTransactionReceipt.transactionHash,
          })
        );
        cb && cb(true);
      } else {
        throw new Error(
          withdrawTransactionReceipt?.logs
            ? JSON.stringify(withdrawTransactionReceipt?.logs)
            : TRANSACTION_FAILED_MESSAGE
        );
      }
    } catch (err: any) {
      console.log(err);
      if (isMetaMaskCancelError(err)) {
        dispatch(
          setSubmitLoadingParams({
            status: 'error',
            modalOpened: false,
            txHash: '',
          })
        );
        snackbarUtil.error(CANCELLED_MESSAGE);
        return;
      }

      let msg = TRANSACTION_FAILED_MESSAGE;
      if (err.code === -32603) {
        msg = CONNECTION_ERROR_MESSAGE;
      }
      dispatch(
        setSubmitLoadingParams({
          status: 'error',
          modalOpened: true,
          msg,
          txHash: '',
        })
      );
      cb && cb(false);
    }
  };

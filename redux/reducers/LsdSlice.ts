import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from 'redux/store';
import { setSubmitLoadingParams } from './AppSlice';
import {
  createWeb3,
  fetchTransactionReceipt,
  fetchTransactionReceiptWithWeb3,
  getEthWeb3,
  isMetaMaskCancelError,
} from 'utils/web3Utils';
import { getFactoryContract } from 'config/eth/contract';
import {
  CANCELLED_MESSAGE,
  CONNECTION_ERROR_MESSAGE,
  TRANSACTION_FAILED_MESSAGE,
} from 'constants/common';
import snackbarUtil from 'utils/snackbarUtils';
import { createPublicClient, createWalletClient, custom } from 'viem';
import { isDev } from 'config/common';
import { sleep } from 'utils/commonUtils';

export interface LsdTokenInWhiteListInfo {
  inWhiteList: boolean;
  queryLoading: boolean;
}
export interface LsdState {
  lsdTokenInWhiteListInfo: LsdTokenInWhiteListInfo;
}

const initialState: LsdState = {
  lsdTokenInWhiteListInfo: {
    inWhiteList: true,
    queryLoading: false,
  },
};

export const lsdSlice = createSlice({
  name: 'lsdEth',
  initialState,
  reducers: {
    setLsdTokenInWhiteListInfo: (
      state: LsdState,
      action: PayloadAction<LsdTokenInWhiteListInfo>
    ) => {
      state.lsdTokenInWhiteListInfo = action.payload;
    },
  },
});

export const { setLsdTokenInWhiteListInfo } = lsdSlice.actions;

export default lsdSlice.reducer;

export const createLsdNetworkStandard =
  (
    writeAsync: any,
    lsdTokenName: string,
    lsdTokenSymbol: string,
    ownerAddress: string,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    dispatch(
      createLsdNetwork(
        writeAsync,
        [lsdTokenName, lsdTokenSymbol, ownerAddress],
        cb
      )
    );
  };

export const createLsdNetworkCustomStandard =
  (
    writeAsync: any,
    lsdTokenName: string,
    lsdTokenSymbol: string,
    ownerAddress: string,
    voters: string[],
    threshold: number,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      createLsdNetwork(
        writeAsync,
        [lsdTokenName, lsdTokenSymbol, ownerAddress, voters, threshold],
        cb
      )
    );
  };

export const createLsdNetworkCustomCustom =
  (
    writeAsync: any,
    lsdTokenAddress: string,
    ownerAddress: string,
    voters: string[],
    threshold: number,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      createLsdNetwork(
        writeAsync,
        [lsdTokenAddress, ownerAddress, voters, threshold],
        cb
      )
    );
  };

const createLsdNetwork =
  (writeAsync: any, params: any[], cb?: (success: boolean) => void): AppThunk =>
  async (dispatch, getState) => {
    const metaMaskAccount = getState().wallet.metaMaskAccount;
    if (!metaMaskAccount) {
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

      const withdrawTransactionReceipt = await fetchTransactionReceiptWithWeb3(
        getEthWeb3(),
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

export const queryLsdTokenInWhiteList =
  (lsdToken: string): AppThunk =>
  async (dispatch, getState) => {
    const metaMaskAccount = getState().wallet.metaMaskAccount;
    if (!metaMaskAccount) return;

    dispatch(
      setLsdTokenInWhiteListInfo({
        inWhiteList: false,
        queryLoading: true,
      })
    );

    try {
      const web3 = createWeb3();
      const contract = new web3.eth.Contract(
        getFactoryContract().abi,
        getFactoryContract().address,
        { from: metaMaskAccount }
      );
      const result = await contract.methods.authorizedLsdToken(lsdToken).call();
      if (result) {
        dispatch(
          setLsdTokenInWhiteListInfo({
            inWhiteList: true,
            queryLoading: false,
          })
        );
      } else {
        throw new Error('not in whitelist');
      }
    } catch (err: any) {
      console.error(err);
      dispatch(
        setLsdTokenInWhiteListInfo({
          inWhiteList: false,
          queryLoading: false,
        })
      );
    }
  };

export const demoCreateLsdNetworkStandard =
  (cb?: (success: boolean) => void): AppThunk =>
  async (dispatch) => {
    dispatch(
      setSubmitLoadingParams({
        status: 'loading',
        modalOpened: true,
        txHash: '',
      })
    );

    await sleep(2000);

    dispatch(
      setSubmitLoadingParams({
        status: 'success',
        modalOpened: true,
        txHash: '',
      })
    );
    cb && cb(true);
  };

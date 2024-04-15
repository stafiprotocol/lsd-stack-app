import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getLrtFactoryContract } from 'config/lrt/contract';
import {
  CANCELLED_MESSAGE,
  CONNECTION_ERROR_MESSAGE,
  TRANSACTION_FAILED_MESSAGE,
} from 'constants/common';
import { AppThunk } from 'redux/store';
import snackbarUtil from 'utils/snackbarUtils';
import {
  createWeb3,
  fetchTransactionReceiptWithWeb3,
  getEthWeb3,
  isMetaMaskCancelError,
} from 'utils/web3Utils';
import { setSubmitLoadingParams } from './AppSlice';
import { BaseError, ContractFunctionRevertedError } from 'viem';

export interface LsdTokenInWhiteListInfo {
  inWhiteList: boolean;
  queryLoading: boolean;
}

export interface LrtOperatorValidInfo {
  isValid: boolean;
  queryLoading: boolean;
}

export interface LsdState {
  lrtTokenInWhiteListInfo: LsdTokenInWhiteListInfo;
  lrtOperatorValidInfo: LrtOperatorValidInfo;
}

const initialState: LsdState = {
  lrtTokenInWhiteListInfo: {
    inWhiteList: true,
    queryLoading: false,
  },
  lrtOperatorValidInfo: {
    isValid: true,
    queryLoading: false,
  },
};

export const lsdSlice = createSlice({
  name: 'lsdEth',
  initialState,
  reducers: {
    setLrtTokenInWhiteListInfo: (
      state: LsdState,
      action: PayloadAction<LsdTokenInWhiteListInfo>
    ) => {
      state.lrtTokenInWhiteListInfo = action.payload;
    },
    setLrtOperatorValidInfo: (
      state: LsdState,
      action: PayloadAction<LrtOperatorValidInfo>
    ) => {
      state.lrtOperatorValidInfo = action.payload;
    },
  },
});

export const { setLrtTokenInWhiteListInfo, setLrtOperatorValidInfo } =
  lsdSlice.actions;

export default lsdSlice.reducer;

export const createLrtNetworkStandard =
  (
    writeAsync: any,
    lsdTokenName: string,
    lsdTokenSymbol: string,
    ownerAddress: string,
    operatorAddress: string,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      createLrtNetwork(
        writeAsync,
        [lsdTokenName, lsdTokenSymbol, operatorAddress, ownerAddress],
        cb
      )
    );
  };

export const createLrtNetworkCustom =
  (
    writeAsync: any,
    lrtTokenAddress: string,
    ownerAddress: string,
    operatorAddress: string,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      createLrtNetwork(
        writeAsync,
        [lrtTokenAddress, operatorAddress, ownerAddress],
        cb
      )
    );
  };

const createLrtNetwork =
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
            txHash: withdrawTransactionReceipt?.transactionHash,
            msg: 'Creating LRT network successfully',
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
      if (err instanceof BaseError) {
        const revertError = err.walk(
          (err) => err instanceof ContractFunctionRevertedError
        );
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? '';
          // do something with `errorName`
          console.log({ errorName });
        }
      }
      // console.log(err);
      console.log(err.message);
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

export const queryLrdTokenInWhiteList =
  (lsdToken: string): AppThunk =>
  async (dispatch, getState) => {
    const metaMaskAccount = getState().wallet.metaMaskAccount;
    if (!metaMaskAccount) return;

    dispatch(
      setLrtTokenInWhiteListInfo({
        inWhiteList: false,
        queryLoading: true,
      })
    );

    try {
      const web3 = createWeb3();
      const contract = new web3.eth.Contract(
        getLrtFactoryContract().abi,
        getLrtFactoryContract().address,
        { from: metaMaskAccount }
      );
      const result = await contract.methods.authorizedLrdToken(lsdToken).call();

      // console.log({ result });

      if (result) {
        dispatch(
          setLrtTokenInWhiteListInfo({
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
        setLrtTokenInWhiteListInfo({
          inWhiteList: false,
          queryLoading: false,
        })
      );
    }
  };

export const queryLrtOperatorValid =
  (operator: string): AppThunk =>
  async (dispatch, getState) => {
    dispatch(
      setLrtOperatorValidInfo({
        isValid: false,
        queryLoading: true,
      })
    );

    try {
      const web3 = createWeb3();
      const contract = new web3.eth.Contract(
        getLrtFactoryContract().abi,
        getLrtFactoryContract().address
      );
      const result = await contract.methods.isValidOperatorArg(operator).call();

      // console.log({ result });

      if (result) {
        dispatch(
          setLrtOperatorValidInfo({
            isValid: true,
            queryLoading: false,
          })
        );
      } else {
        throw new Error('operator not valid');
      }
    } catch (err: any) {
      console.error(err);
      dispatch(
        setLrtOperatorValidInfo({
          isValid: false,
          queryLoading: false,
        })
      );
    }
  };

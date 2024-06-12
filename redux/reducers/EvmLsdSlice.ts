import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getFactoryContract } from 'config/eth/contract';
import { getEvmFactoryAbi } from 'config/evm';
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
  getWeb3,
  isMetaMaskCancelError,
} from 'utils/web3Utils';
import { setSubmitLoadingParams } from './AppSlice';
import { EvmLsdTokenConfig } from 'interfaces/common';
import { getEvmScanTxUrl } from 'config/explorer';
import { ethers } from 'ethers';

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
  name: 'lsdEvm',
  initialState,
  reducers: {
    setEvmLsdTokenInWhiteListInfo: (
      state: LsdState,
      action: PayloadAction<LsdTokenInWhiteListInfo>
    ) => {
      state.lsdTokenInWhiteListInfo = action.payload;
    },
  },
});

export const { setEvmLsdTokenInWhiteListInfo } = lsdSlice.actions;

export default lsdSlice.reducer;

export const createEvmLsdNetworkCustomStandard =
  (
    writeAsync: any,
    lsdTokenConfig: EvmLsdTokenConfig,
    lsdTokenName: string,
    lsdTokenSymbol: string,
    ownerAddress: string,
    voters: string[],
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      createLsdNetwork(
        writeAsync,
        lsdTokenConfig,
        [lsdTokenName, lsdTokenSymbol, voters, ownerAddress],
        cb
      )
    );
  };

export const createEvmLsdNetworkCustomCustom =
  (
    writeAsync: any,
    lsdTokenConfig: EvmLsdTokenConfig,
    lsdTokenAddress: string,
    ownerAddress: string,
    voters: string[],
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      createLsdNetwork(
        writeAsync,
        lsdTokenConfig,
        [lsdTokenAddress, voters, ownerAddress],
        cb
      )
    );
  };

const createLsdNetwork =
  (
    writeAsync: any,
    lsdTokenConfig: EvmLsdTokenConfig,
    params: any[],
    cb?: (success: boolean) => void
  ): AppThunk =>
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
      console.log(...params);
      console.log({ lsdTokenConfig });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log({ signer });

      const contract = new ethers.Contract(
        lsdTokenConfig.factoryContract,
        getEvmFactoryAbi(lsdTokenConfig.symbol) as any,
        provider
      );

      const contractWithSigner = contract.connect(signer);
      const result = await contractWithSigner.createLsdNetwork(...params);
      console.log({ result });

      // const result = await writeAsync({
      //   args: [...params],
      //   from: metaMaskAccount,
      // });
      const web3 = createWeb3();

      // const contract = new web3.eth.Contract(
      //   getEvmFactoryAbi(lsdTokenConfig.symbol),
      //   lsdTokenConfig.factoryContract,
      //   { from: metaMaskAccount }
      // );
      // const result = await contract.methods.createLsdNetwork(...params).call();
      // console.log({ result });

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
            explorerUrl: getEvmScanTxUrl(
              lsdTokenConfig.symbol,
              withdrawTransactionReceipt.transactionHash
            ),
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

export const queryEvmLsdTokenInWhiteList =
  (lsdTokenConfig: EvmLsdTokenConfig, lsdToken: string): AppThunk =>
  async (dispatch, getState) => {
    dispatch(
      setEvmLsdTokenInWhiteListInfo({
        inWhiteList: false,
        queryLoading: true,
      })
    );

    try {
      const web3 = getWeb3(lsdTokenConfig.rpc);
      const contract = new web3.eth.Contract(
        getEvmFactoryAbi(),
        lsdTokenConfig.factoryContract
      );
      const result = await contract.methods
        .authorizedLsdToken(lsdToken)
        .call()
        .catch((err: any) => {});
      if (result) {
        dispatch(
          setEvmLsdTokenInWhiteListInfo({
            inWhiteList: true,
            queryLoading: false,
          })
        );
      } else {
        throw new Error('not in whitelist');
      }
    } catch (err: any) {
      console.log(err);
      dispatch(
        setEvmLsdTokenInWhiteListInfo({
          inWhiteList: false,
          queryLoading: false,
        })
      );
    }
  };

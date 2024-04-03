import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from 'redux/store';
import { setSubmitLoadingParams } from './AppSlice';
import {
  createWeb3,
  fetchTransactionReceipt,
  getEthWeb3,
} from 'utils/web3Utils';
import { getFactoryContract } from 'config/eth/contract';
import {
  CANCELLED_MESSAGE,
  CONNECTION_ERROR_MESSAGE,
  TRANSACTION_FAILED_MESSAGE,
} from 'constants/common';
import snackbarUtil from 'utils/snackbarUtils';
import { getLrtFactoryContract } from 'config/lrt/contract';
import {
  createPublicClient,
  createWalletClient,
  custom,
  getAddress,
  getContract,
  http,
} from 'viem';
import { holesky, mainnet } from 'viem/chains';
import { isDev } from 'config/common';

export interface LsdTokenInWhiteListInfo {
  inWhiteList: boolean;
  queryLoading: boolean;
}
export interface LsdState {
  lrtTokenInWhiteListInfo: LsdTokenInWhiteListInfo;
}

const initialState: LsdState = {
  lrtTokenInWhiteListInfo: {
    inWhiteList: true,
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
  },
});

export const { setLrtTokenInWhiteListInfo } = lsdSlice.actions;

export default lsdSlice.reducer;

export const createLrtNetworkStandard =
  (
    lsdTokenName: string,
    lsdTokenSymbol: string,
    ownerAddress: string,
    operatorAddress: string,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      createLrtNetwork(
        'createLrdNetwork',
        [lsdTokenName, lsdTokenSymbol, operatorAddress, ownerAddress],
        cb
      )
    );
  };

export const createLrtNetworkCustom =
  (
    lrtTokenAddress: string,
    ownerAddress: string,
    operatorAddress: string,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      createLrtNetwork(
        'createLrdNetworkWithLrdToken',
        [lrtTokenAddress, operatorAddress, ownerAddress],
        cb
      )
    );
  };

const createLrtNetwork =
  (method: string, params: any[], cb?: (success: boolean) => void): AppThunk =>
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
      const viemPublicClient = createPublicClient({
        chain: isDev() ? holesky : mainnet,
        transport: http(),
      });
      const viemWalletClient = createWalletClient({
        chain: isDev() ? holesky : mainnet,
        transport: custom(window.ethereum!),
      });

      const { request } = await viemPublicClient.simulateContract({
        account: metaMaskAccount as `0x${string}`,
        address: getLrtFactoryContract().address,
        abi: getLrtFactoryContract().abi,
        functionName: method,
        args: params,
      });
      const txHash = await viemWalletClient.writeContract(request);
      const transaction = await fetchTransactionReceipt(
        viemPublicClient,
        txHash
      );

      if (transaction?.status === 'success') {
        dispatch(
          setSubmitLoadingParams({
            status: 'success',
            modalOpened: true,
            txHash,
            msg: 'Creating LRT network successfully',
          })
        );
        cb && cb(true);
      } else {
        throw new Error(
          transaction?.logs
            ? JSON.stringify(transaction?.logs)
            : TRANSACTION_FAILED_MESSAGE
        );
      }
    } catch (err: any) {
      console.log(err);
      if (err.code === 4001) {
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

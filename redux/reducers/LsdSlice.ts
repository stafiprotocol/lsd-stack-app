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
import { createPublicClient, createWalletClient, custom } from 'viem';
import { isDev } from 'config/common';
import { holesky, mainnet } from 'viem/chains';
import { viemPublicClient } from 'config/viemClient';

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
    lsdTokenName: string,
    lsdTokenSymbol: string,
    ownerAddress: string,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    dispatch(
      createLsdNetwork(
        'createLsdNetworkWithEntrustedVoters',
        [lsdTokenName, lsdTokenSymbol, ownerAddress],
        cb
      )
    );
  };

export const createLsdNetworkCustomStandard =
  (
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
        'createLsdNetwork',
        [lsdTokenName, lsdTokenSymbol, ownerAddress, voters, threshold],
        cb
      )
    );
  };

export const createLsdNetworkCustomCustom =
  (
    lsdTokenAddress: string,
    ownerAddress: string,
    voters: string[],
    threshold: number,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch) => {
    dispatch(
      createLsdNetwork(
        'createLsdNetworkWithLsdToken',
        [lsdTokenAddress, ownerAddress, voters, threshold],
        cb
      )
    );
  };

const createLsdNetwork =
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
      const viemWalletClient = createWalletClient({
        chain: isDev() ? holesky : mainnet,
        transport: custom(window.ethereum!),
      });

      const { request } = await viemPublicClient.simulateContract({
        account: metaMaskAccount as `0x${string}`,
        address: getFactoryContract().address,
        abi: getFactoryContract().abi,
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

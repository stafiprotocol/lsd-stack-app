import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from 'redux/store';
import {
  Address,
  beginCell,
  Dictionary,
  Sender,
  SenderArguments,
  toNano,
  TonClient,
  WalletContractV4,
} from '@ton/ton';
import { Stack } from 'config/ton/wrappers/stack';
import { stackContractAddress } from 'config/ton';
import { TonConnectUI } from '@tonconnect/ui-react';
import {
  metadataDictionaryValue,
  toMetadataKey,
} from 'config/ton/wrappers/lsdTokenMaster';
import { setSubmitLoadingParams } from './AppSlice';
import {
  CANCELLED_ERR_MESSAGE5,
  CANCELLED_MESSAGE,
  TRANSACTION_FAILED_MESSAGE,
} from 'constants/common';
import { sleep } from 'utils/commonUtils';
import { isTonCancelError, parseTonTxHash } from 'utils/web3Utils';
import snackbarUtil from 'utils/snackbarUtils';
import {
  getStorage,
  saveTonSeqNo,
  STORAGE_TON_SEQNO,
} from 'utils/storageUtils';
import { StakePool } from 'config/ton/wrappers/stakePool';

export interface TonState {
  sendNewStakePoolLoading: boolean;
}

const initialState: TonState = {
  sendNewStakePoolLoading: false,
};

export const tonSlice = createSlice({
  name: 'ton',
  initialState,
  reducers: {
    setSendNewStakePoolLoading: (state, action: PayloadAction<boolean>) => {
      state.sendNewStakePoolLoading = action.payload;
    },
  },
});

export const { setSendNewStakePoolLoading } = tonSlice.actions;

export default tonSlice.reducer;

export const sendNewStakePool =
  (
    tonClient: TonClient,
    tonConnectUI: TonConnectUI,
    tokenName: string,
    tokenSymbol: string,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setSendNewStakePoolLoading(true));
    dispatch(
      setSubmitLoadingParams({
        status: 'loading',
        modalOpened: true,
        txHash: '',
      })
    );
    // "te6cckEBAgEAtwAB4YgA8TBp8ZB0F2gsFP1nKbJk1FsBReQAA2UK0h9DPXjzqbQCyDnAPbwzcdoX6mTM7d8UhVX3AzQlpm5i+bQkxq0+7FDYMueBXA8V/GBN2AMRsix6PCf89pXti8ub3C6Dc83gEU1NGLs4XamAAAAAcAAcAQCCYgA1C0uhvrqiVknXQ0ePTY3Sak9cb6saWa3XCq/2+tKf6aHqrKGIAAAAAAAAAAAAAAAAAATceLkAAAAAAAAAAACdKdmU"
    // const bocCellBytes = await tonweb.boc.Cell.oneFromBoc(
    //   tonweb.utils.base64ToBytes(
    //     'te6cckEBAgEAtwAB4YgA8TBp8ZB0F2gsFP1nKbJk1FsBReQAA2UK0h9DPXjzqbQCyDnAPbwzcdoX6mTM7d8UhVX3AzQlpm5i+bQkxq0+7FDYMueBXA8V/GBN2AMRsix6PCf89pXti8ub3C6Dc83gEU1NGLs4XamAAAAAcAAcAQCCYgA1C0uhvrqiVknXQ0ePTY3Sak9cb6saWa3XCq/2+tKf6aHqrKGIAAAAAAAAAAAAAAAAAATceLkAAAAAAAAAAACdKdmU'
    //   )
    // ).hash();
    // console.log(tonweb.utils.bytesToHex(bocCellBytes));
    // const hashBase64 = tonweb.utils.bytesToBase64(bocCellBytes);
    // console.log({ hashBase64 });
    // let txHash: string = '';

    const seqNoStr = getStorage(STORAGE_TON_SEQNO);
    const seqNo = seqNoStr === null ? -1 : Number(seqNoStr);

    const sender: Sender = {
      send: async (args: SenderArguments) => {
        try {
          await tonConnectUI.sendTransaction({
            messages: [
              {
                address: args.to.toString(),
                amount: args.value.toString(),
                payload: args.body?.toBoc().toString('base64'),
              },
            ],
            validUntil: Date.now() + 5 * 60 * 1000,
          });
        } catch (err: any) {
          if (isTonCancelError(err)) {
            throw new Error(CANCELLED_ERR_MESSAGE5);
          }
        }
      },
    };

    try {
      const pubkey = tonConnectUI.wallet!.account!.publicKey as string;
      const walletContract = WalletContractV4.create({
        workchain: 0,
        publicKey: Buffer.from(pubkey, 'hex'),
      });
      const wallet = tonClient.open(walletContract);

      // let curSeqNo = await wallet.getSeqno();
      // await sleep(1000);

      const contract = tonClient.open(
        new Stack(Address.parse(stackContractAddress))
      );
      const fee = await contract.getNewStakePoolFee();

      const lastTxHash = await getLastTxHash(tonClient, tonConnectUI);

      const contentDict = Dictionary.empty(
        Dictionary.Keys.BigUint(256),
        metadataDictionaryValue
      )
        .set(toMetadataKey('decimals'), '9')
        .set(toMetadataKey('symbol'), tokenSymbol)
        .set(toMetadataKey('name'), tokenName)
        .set(toMetadataKey('description'), '')
        .set(toMetadataKey('image'), '');
      const content = beginCell()
        .storeUint(0, 8)
        .storeDict(contentDict)
        .endCell();

      await contract.sendNewStakePool(sender, {
        value: fee,
        sequence: BigInt(seqNo + 1),
        content,
      });

      let txHash: string | undefined;
      while (true) {
        txHash = await getLastTxHash(tonClient, tonConnectUI);
        if (txHash && txHash !== lastTxHash) break;
        await sleep(1000);
      }

      await sleep(8000);

      dispatch(
        setSubmitLoadingParams({
          status: 'success',
          modalOpened: true,
          txHash,
          msg: 'Creating LSD network successfully',
        })
      );
      cb && cb(true);
      dispatch(setSendNewStakePoolLoading(false));

      saveTonSeqNo(seqNo + 1 + '');
    } catch (err) {
      console.log(err);
      if (isTonCancelError(err)) {
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

      dispatch(
        setSubmitLoadingParams({
          status: 'error',
          modalOpened: true,
          msg: TRANSACTION_FAILED_MESSAGE,
          txHash: '',
        })
      );
      cb && cb(false);
      dispatch(setSendNewStakePoolLoading(false));
    }
  };

const getLastTxHash = async (
  tonClient: TonClient,
  tonConnectUI: TonConnectUI
): Promise<string | undefined> => {
  const tonAddress = Address.parse(tonConnectUI.account!.address);
  const state = await tonClient.getContractState(tonAddress);
  if (!state.lastTransaction) return;
  const { lt, hash } = state.lastTransaction!;
  const tx = await tonClient.getTransaction(tonAddress, lt, hash);
  if (!tx) return;
  return parseTonTxHash(tx);
};

const getSender = (tonConnectUI: TonConnectUI) => {
  const sender: Sender = {
    send: async (args: SenderArguments) => {
      try {
        await tonConnectUI.sendTransaction({
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              payload: args.body?.toBoc().toString('base64'),
            },
          ],
          validUntil: Date.now() + 5 * 60 * 1000,
        });
      } catch (err: any) {
        if (isTonCancelError(err)) {
          throw new Error(CANCELLED_ERR_MESSAGE5);
        }
      }
    },
  };
  return sender;
};

export const sendSetPlatformCommissionRate =
  (
    tonConnectUI: TonConnectUI,
    tonClient: TonClient,
    stakePoolAddress: string,
    rate: string,
    cb?: (success: boolean, cancelled?: boolean) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      const stakePool = tonClient.open(
        new StakePool(Address.parse(stakePoolAddress))
      );
      const sender = getSender(tonConnectUI);

      const lastTxHash = await getLastTxHash(tonClient, tonConnectUI);

      await stakePool.sendSetPlatformCommissionRate(sender, {
        value: toNano('0.1'),
        rate: BigInt(Number(rate) * 100),
      });

      let txHash: string | undefined;
      while (true) {
        txHash = await getLastTxHash(tonClient, tonConnectUI);
        if (txHash && txHash !== lastTxHash) break;
        await sleep(1000);
      }

      await sleep(8000);

      cb && cb(true);
    } catch (err) {
      console.log(err);
      if (isTonCancelError(err)) {
        snackbarUtil.error(CANCELLED_MESSAGE);
        cb && cb(true, true);
        return;
      }
      cb && cb(false);
    }
  };

export const sendSetMinStakeAmount =
  (
    tonConnectUI: TonConnectUI,
    tonClient: TonClient,
    stakePoolAddress: string,
    amount: string,
    cb?: (success: boolean, cancelled?: boolean) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      const stakePool = tonClient.open(
        new StakePool(Address.parse(stakePoolAddress))
      );
      const sender = getSender(tonConnectUI);

      const lastTxHash = await getLastTxHash(tonClient, tonConnectUI);

      await stakePool.sendSetMinStakeAmount(sender, {
        value: toNano('0.1'),
        minStakeAmount: BigInt(Number(amount) * Math.pow(10, 9)),
      });

      let txHash: string | undefined;
      while (true) {
        txHash = await getLastTxHash(tonClient, tonConnectUI);
        if (txHash && txHash !== lastTxHash) break;
        await sleep(1000);
      }

      await sleep(8000);

      cb && cb(true);
    } catch (err) {
      console.log(err);
      if (isTonCancelError(err)) {
        snackbarUtil.error(CANCELLED_MESSAGE);
        cb && cb(true, true);
        return;
      }
      cb && cb(false);
    }
  };

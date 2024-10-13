import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from 'redux/store';
import {
  Address,
  beginCell,
  Cell,
  Dictionary,
  Message,
  Sender,
  SenderArguments,
  storeMessage,
  toNano,
  TonClient,
  WalletContractV3R2,
  WalletContractV4,
} from '@ton/ton';
import { Stack } from 'config/ton/wrappers/stack';
import { stackContractAddress } from 'config/ton';
import { TonConnectUI } from '@tonconnect/ui-react';
import { StakePool } from 'config/ton/wrappers/stakePool';
import {
  LsdTokenMaster,
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
import { i } from '@tanstack/query-core/build/legacy/queryClient-aPcvMwE9';
import { isTonCancelError } from 'utils/web3Utils';
import snackbarUtil from 'utils/snackbarUtils';
import tonweb from 'tonweb';

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
    tokenDecimals: string,
    tokenDescription: string,
    tokenImage: string,
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
    let txHash: string = '';

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
          const tonAddress = Address.parse(tonConnectUI.account!.address);
          const state = await tonClient.getContractState(tonAddress);
          if (!state.lastTransaction) return;
          const { lt, hash } = state.lastTransaction!;
          const tx = await tonClient.getTransaction(tonAddress, lt, hash);
          if (!tx) return;
          const msgCell = beginCell()
            .store(storeMessage(tx.inMessage as Message))
            .endCell();
          const inMsgHash = msgCell.hash().toString('hex');
          txHash = inMsgHash;
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

      let curSeqNo = await wallet.getSeqno();
      await sleep(1000);

      const contract = tonClient.open(
        new Stack(Address.parse(stackContractAddress))
      );
      const fee = await contract.getNewStakePoolFee();
      await sleep(1000);

      const stakeResult = await contract.sendNewStakePool(sender, {
        value: fee,
      });
      // console.log({ stakeResult });

      while (true) {
        const newSeqNo = await wallet.getSeqno();
        if (newSeqNo > curSeqNo) {
          curSeqNo = newSeqNo;
          break;
        }
        await sleep(1000);
      }
      await sleep(1000);

      const contractAddresses = await contract.getContractAddresses(
        Address.parse(tonConnectUI.account!.address),
        BigInt(0)
      );
      const stakePool = tonClient.open(
        new StakePool(contractAddresses.stakePool)
      );
      const lsdTokenMaster = tonClient.open(
        new LsdTokenMaster(contractAddresses.lsdTokenMaster)
      );
      await sleep(1000);

      // const stakePoolBalance = await stakePool.getBalance();
      const contentDict = Dictionary.empty(
        Dictionary.Keys.BigUint(256),
        metadataDictionaryValue
      )
        .set(toMetadataKey('decimals'), tokenDecimals)
        .set(toMetadataKey('symbol'), tokenSymbol)
        .set(toMetadataKey('name'), tokenName)
        .set(toMetadataKey('description'), tokenDescription)
        .set(toMetadataKey('image'), tokenImage);

      const content = beginCell()
        .storeUint(0, 8)
        .storeDict(contentDict)
        .endCell();

      const result = await stakePool.sendProxySetContent(sender, {
        value: toNano('0.1'),
        dst: lsdTokenMaster.address,
        content,
      });

      while (true) {
        const newSeqNo = await wallet.getSeqno();
        // console.log({ newSeqNo });
        if (newSeqNo > curSeqNo) {
          curSeqNo = newSeqNo;
          break;
        }
        await sleep(1000);
      }
      await sleep(1000);

      let jettonData = await lsdTokenMaster.getJettonData();

      const cell = jettonData[3];
      const slice = cell.beginParse();
      const prefix = slice.loadUint(8);
      if (prefix !== 0) {
        console.info('Expected a zero prefix for metadata but got %s', prefix);
        return;
      }
      const metadata = slice.loadDict(
        Dictionary.Keys.BigUint(256),
        metadataDictionaryValue
      );

      const labelsMap: Record<string, string | undefined> = {};
      labelsMap[toMetadataKey('decimals').toString()] = 'decimals';
      labelsMap[toMetadataKey('symbol').toString()] = 'symbol';
      labelsMap[toMetadataKey('name').toString()] = 'name';
      labelsMap[toMetadataKey('description').toString()] = 'description';
      labelsMap[toMetadataKey('image').toString()] = 'image';

      // console.info();
      // console.info('Jetton Metadata');
      // console.info('===============');
      for (const key of [
        'decimals',
        'symbol',
        'name',
        'description',
        'image',
      ]) {
        // console.info(
        //   '    %s: %s',
        //   key.padStart(12),
        //   metadata.get(toMetadataKey(key)) ?? ''
        // );
        metadata.delete(toMetadataKey(key));
      }
      // console.info();

      // if (metadata.size > 0) {
      //   console.info('Unknown Keys');
      //   console.info('------------');
      //   for (const key of metadata.keys()) {
      //     console.info('    %s: %s', key.toString(), metadata.get(key));
      //   }
      //   console.info();
      // }
      await sleep(2000);
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

import Web3 from 'web3';
import { getEthereumRpc } from 'config/eth/env';
import { AbiItem } from 'web3-utils';
import { PublicClient } from 'viem';
import { sleep } from './commonUtils';
import {
  CANCELLED_ERR_MESSAGE1,
  CANCELLED_ERR_MESSAGE2,
  CANCELLED_ERR_MESSAGE3,
  CANCELLED_ERR_MESSAGE4,
  CANCELLED_ERR_MESSAGE5,
} from 'constants/common';
import { beginCell, Message, storeMessage, Transaction } from '@ton/core';

declare const window: any;

export function createWeb3(provider?: any) {
  return new Web3(provider || Web3.givenProvider);
}

let ethWeb3: Web3 | undefined = undefined;

let web3Cache: { [key: string]: Web3 } = {};

export function getWeb3(rpc: string) {
  let web3Instance = web3Cache[rpc];

  if (!web3Instance) {
    const useWebsocket = rpc.startsWith('wss');
    web3Instance = createWeb3(
      useWebsocket
        ? new Web3.providers.WebsocketProvider(rpc)
        : new Web3.providers.HttpProvider(rpc)
    );
    web3Cache[rpc] = web3Instance;
  }
  return web3Instance;
}

/**
 * get Ethereum web3 instance singleton
 */
export function getEthWeb3() {
  const rpcLink = getEthereumRpc();
  if (!ethWeb3) {
    const useWebsocket = rpcLink.startsWith('wss');
    ethWeb3 = createWeb3(
      useWebsocket
        ? new Web3.providers.WebsocketProvider(rpcLink)
        : new Web3.providers.HttpProvider(rpcLink)
    );
  }
  return ethWeb3;
}

export async function getErc20AssetBalance(
  userAddress: string | undefined,
  tokenAbi: AbiItem | AbiItem[],
  tokenAddress: string | undefined
) {
  if (!userAddress || !tokenAbi || !tokenAddress) {
    return undefined;
  }
  try {
    let web3 = getEthWeb3();
    let contract = new web3.eth.Contract(tokenAbi, tokenAddress, {
      from: userAddress,
    });
    const result = await contract.methods.balanceOf(userAddress).call();
    let balance = web3.utils.fromWei(result + '', 'ether');

    return balance;
  } catch (err: any) {
    return undefined;
  }
}

export function validateAddress(address: string) {
  return Web3.utils.isAddress(address);
}

export async function fetchTransactionReceipt(
  publicClient: PublicClient,
  hash: `0x${string}`
) {
  if (!hash) {
    return undefined;
  }
  for (let i = 0; i < 10; i++) {
    let transactionReceipt;
    try {
      transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
    } catch {}

    if (transactionReceipt) {
      return transactionReceipt;
    } else {
      await sleep(6000);
    }
  }

  return undefined;
}

export async function fetchTransactionReceiptWithWeb3(
  web3Client: Web3,
  hash: `0x${string}`
) {
  if (!hash) {
    return undefined;
  }
  for (let i = 0; i < 10; i++) {
    let transactionReceipt;
    try {
      transactionReceipt = await web3Client.eth.getTransactionReceipt(hash);
    } catch {}

    if (transactionReceipt) {
      return transactionReceipt;
    } else {
      await sleep(6000);
    }
  }

  return undefined;
}

export const isMetaMaskCancelError = (err: any) => {
  return (
    err.code === 4001 ||
    err.message.indexOf(CANCELLED_ERR_MESSAGE1) >= 0 ||
    err.message.indexOf(CANCELLED_ERR_MESSAGE2) >= 0 ||
    err.message.indexOf(CANCELLED_ERR_MESSAGE3) >= 0 ||
    err.message.indexOf(CANCELLED_ERR_MESSAGE4) >= 0
  );
};

export const isSolanaCancelError = (err: any) => {
  return (
    err.message.indexOf(CANCELLED_ERR_MESSAGE1) >= 0 ||
    err.message.indexOf(CANCELLED_ERR_MESSAGE2) >= 0 ||
    err.message.indexOf(CANCELLED_ERR_MESSAGE3) >= 0 ||
    err.message.indexOf(CANCELLED_ERR_MESSAGE4) >= 0
  );
};

export const isTonCancelError = (err: any) => {
  return err.message.indexOf(CANCELLED_ERR_MESSAGE5) >= 0;
};

export const parseTonTxHash = (tx: Transaction): string => {
  const msgCell = beginCell()
    .store(storeMessage(tx.inMessage as Message))
    .endCell();
  const inMsgHash = msgCell.hash().toString('hex');
  return inMsgHash;
};

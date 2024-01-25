import Web3 from 'web3';
import { getEthereumRpc } from 'config/env';
import { AbiItem } from 'web3-utils';

declare const window: any;

export function createWeb3(provider?: any) {
  return new Web3(provider || Web3.givenProvider);
}

let ethWeb3: Web3 | undefined = undefined;

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

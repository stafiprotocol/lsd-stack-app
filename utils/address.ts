import { checkAddress as checkCosmosAddress } from '@stafihub/apps-wallet';
import base58 from 'bs58';
import Web3 from 'web3';

export const validateETHAddress = (address: string | undefined) => {
  if (!address) {
    return false;
  }
  return Web3.utils.isAddress(address);
};

export function validateSolanaAddress(address: string | undefined): boolean {
  if (!address) {
    return false;
  }
  try {
    const decoded = base58.decode(address);
    if (decoded.length != 32) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function validateStafiHubAddress(address: string | undefined): boolean {
  return checkCosmosAddress(address || '', 'stafi');
}

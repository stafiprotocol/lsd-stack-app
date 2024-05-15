import networkBalanceContractAbi from './abi/networkBalance.json';
import networkWithdrawContractAbi from './abi/networkWithdraw.json';
import { AbiItem } from 'web3-utils';
import factoryContractAbi from './abi/factory.json';
import networkProposalAbi from './abi/networkProposal.json';
import lsdTokenContractAbi from './abi/lsdToken.json';
import nodeDepositContractAbi from './abi/nodeDeposit.json';
import userDepositContractAbi from './abi/userDeposit.json';

/**
 * get lsd token contract ABI
 */
export function getLsdTokenContractAbi() {
  return lsdTokenContractAbi as AbiItem[];
}

/**
 * get ETH withdraw contract ABI
 */
export function getEthWithdrawContractAbi() {
  return networkWithdrawContractAbi as AbiItem[];
}

/**
 * get networkBalance contract ABI
 */
export function getNetworkBalanceContractAbi() {
  return networkBalanceContractAbi as AbiItem[];
}

/**
 * get factory contract info
 */
export function getFactoryContract() {
  return {
    abi: factoryContractAbi as AbiItem[],
    address: '0xd9f4f1474f7609D77379324C69b577DD7C8B266f' as `0x${string}`,
  };
}

/**
 * get network proposal contract abi
 */
export function getNetworkProposalContractAbi() {
  return networkProposalAbi as AbiItem[];
}

/**
 * get network node deposit abi
 */
export function getEthNodeDepositContractAbi() {
  return nodeDepositContractAbi as AbiItem[];
}

/**
 * get network user deposit abi
 */
export function getEthUserDepositContractAbi() {
  return userDepositContractAbi as AbiItem[];
}

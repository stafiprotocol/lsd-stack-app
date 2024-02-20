import networkBalanceContractAbi from "./abi/networkBalance.json";
import networkWithdrawContractAbi from "./abi/networkWithdraw.json";
import { AbiItem } from "web3-utils";
import factoryContractAbi from "./abi/factory.json";
import networkProposalAbi from "./abi/networkProposal.json";
import lsdTokenContractAbi from "./abi/lsdToken.json";

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
    address: "0xf9bb59107e293951205cdeef8b482f48f35e5cc1" as `0x${string}`,
  };
}

/**
 * get network proposal contract abi
 */
export function getNetworkProposalContractAbi() {
  return networkProposalAbi as AbiItem[];
}

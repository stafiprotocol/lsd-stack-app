import {
  getFactoryContract,
  getLsdTokenContractAbi,
} from 'config/eth/contract';
import { AppEco, EvmLsdTokenConfig } from 'interfaces/common';
import { ModuleSetting } from 'interfaces/module';
import { useCallback, useEffect, useState } from 'react';
import { getModuleListFromDb } from 'utils/dbUtils';
import { getEthWeb3, getWeb3 } from 'utils/web3Utils';
import { useWalletAccount } from './useWalletAccount';
import { useUserAddress } from './useUserAddress';
import { getEvmFactoryAbi } from 'config/evm';
import {
  getLrtFactoryContract,
  getLrtTokenContractAbi,
} from 'config/lrt/contract';
import { getNeutronWasmClient, getStakeManagerClient } from 'utils/cosmosUtils';
import { LsdToken } from 'gen/neutron';

export interface LsdHistoryItem {
  tokenAddress: string;
  tokenName: string;
}

export function useModuleList(
  eco: AppEco,
  evmLsdTokenConfig?: EvmLsdTokenConfig
) {
  const [moduleList, setModuleList] = useState<ModuleSetting[]>([]);
  const userAddress = useUserAddress(eco);

  const [lsdHistoryList, setLsdHistoryList] = useState<LsdHistoryItem[]>([]);

  const updateEthList = useCallback(async () => {
    try {
      if (!userAddress) {
        setLsdHistoryList([]);
        return;
      }
      const web3 = getEthWeb3();
      const contract = new web3.eth.Contract(
        getFactoryContract().abi,
        getFactoryContract().address
      );
      const lsdTokensOfCreater = await contract.methods
        .lsdTokensOfCreater(userAddress)
        .call();

      const requests = lsdTokensOfCreater?.map((tokenAddress: string) => {
        return (async () => {
          const lsdTokenContract = new web3.eth.Contract(
            getLsdTokenContractAbi(),
            tokenAddress
          );
          const tokenSymbol = await lsdTokenContract.methods.symbol().call();
          return tokenSymbol;
        })();
      });

      const symbols = await Promise.all(requests);

      const resList: LsdHistoryItem[] = [];
      lsdTokensOfCreater?.forEach((tokenAddress: string, index: number) => {
        if (tokenAddress && symbols[index]) {
          resList.push({
            tokenAddress: tokenAddress,
            tokenName: symbols[index] || '',
          });
        }
      });
      setLsdHistoryList(resList);
      console.log({ resList });
    } catch (err: any) {
      console.log({ err });
    }
  }, [userAddress]);

  const updateLrtList = useCallback(async () => {
    try {
      if (!userAddress) {
        setLsdHistoryList([]);
        return;
      }
      const web3 = getEthWeb3();
      const contract = new web3.eth.Contract(
        getLrtFactoryContract().abi,
        getLrtFactoryContract().address
      );
      const lrdTokensOfCreator = await contract.methods
        .lrdTokensOfCreator(userAddress)
        .call();

      const requests = lrdTokensOfCreator?.map((tokenAddress: string) => {
        return (async () => {
          const lrdTokenContract = new web3.eth.Contract(
            getLrtTokenContractAbi(),
            tokenAddress
          );
          const tokenSymbol = await lrdTokenContract.methods.symbol().call();
          return tokenSymbol;
        })();
      });

      const symbols = await Promise.all(requests);

      const resList: LsdHistoryItem[] = [];
      lrdTokensOfCreator?.forEach((tokenAddress: string, index: number) => {
        if (tokenAddress && symbols[index]) {
          resList.push({
            tokenAddress: tokenAddress,
            tokenName: symbols[index] || '',
          });
        }
      });
      setLsdHistoryList(resList);
      console.log({ resList });
    } catch (err: any) {
      console.log({ err });
    }
  }, [userAddress]);

  const updateEvmList = useCallback(async () => {
    try {
      if (!userAddress || !evmLsdTokenConfig) {
        setLsdHistoryList([]);
        return;
      }
      const web3 = getWeb3(evmLsdTokenConfig.rpc);
      const contract = new web3.eth.Contract(
        getEvmFactoryAbi(),
        evmLsdTokenConfig.factoryContract
      );
      const lsdTokensOfCreater = await contract.methods
        .lsdTokensOfCreater(userAddress)
        .call();

      const requests = lsdTokensOfCreater?.map((tokenAddress: string) => {
        return (async () => {
          const lsdTokenContract = new web3.eth.Contract(
            getLsdTokenContractAbi(),
            tokenAddress
          );
          const tokenSymbol = await lsdTokenContract.methods.symbol().call();
          return tokenSymbol;
        })();
      });

      const symbols = await Promise.all(requests);

      const resList: LsdHistoryItem[] = [];
      lsdTokensOfCreater?.forEach((tokenAddress: string, index: number) => {
        if (tokenAddress && symbols[index]) {
          resList.push({
            tokenAddress: tokenAddress,
            tokenName: symbols[index] || '',
          });
        }
      });
      setLsdHistoryList(resList);
      console.log({ resList });
    } catch (err: any) {
      console.log({ err });
    }
  }, [userAddress, evmLsdTokenConfig]);

  const updateNeurtonList = useCallback(async () => {
    try {
      if (!userAddress) {
        setLsdHistoryList([]);
        return;
      }
      const stakeManagerClient = await getStakeManagerClient();
      const interchainAccountIds =
        await stakeManagerClient.queryInterchainAccountIdFromCreator({
          addr: userAddress,
        });

      console.log({ interchainAccountIds });

      const wasmClient = await getNeutronWasmClient();
      const requests = interchainAccountIds?.map((ica: string) => {
        return (async () => {
          try {
            const output =
              await stakeManagerClient.queryInterchainAccountAddressFromContract(
                {
                  interchain_account_id: ica,
                }
              );
            const pool_addr = output.pool_address_ica_info.ica_addr;

            const poolInfo = await stakeManagerClient.queryPoolInfo({
              pool_addr,
            });
            const lsdTokenClient = new LsdToken.Client(
              wasmClient,
              poolInfo.lsd_token
            );
            const tokenInfo = await lsdTokenClient.queryTokenInfo();
            return tokenInfo.symbol;
          } catch (err) {}
        })();
      });

      const symbols = await Promise.all(requests);

      const resList: LsdHistoryItem[] = [];
      interchainAccountIds?.forEach((tokenAddress: string, index: number) => {
        if (tokenAddress && symbols[index]) {
          resList.push({
            tokenAddress: tokenAddress,
            tokenName: symbols[index] || '',
          });
        }
      });
      setLsdHistoryList(resList);
      console.log({ resList });
    } catch (err: any) {
      console.log({ err });
    }
  }, [userAddress]);

  useEffect(() => {
    if (eco === AppEco.Eth) {
      updateEthList();
    } else if (eco === AppEco.Evm) {
      updateEvmList();
    } else if (eco === AppEco.Lrt) {
      updateLrtList();
    } else if (eco === AppEco.Cosmos) {
      updateNeurtonList();
    }
  }, [eco, updateEthList, updateEvmList, updateLrtList, updateNeurtonList]);

  return { lsdHistoryList };
}

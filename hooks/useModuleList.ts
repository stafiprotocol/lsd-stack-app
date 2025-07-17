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
import { PublicKey } from '@solana/web3.js';
import { solanaPrograms } from 'config/sol';
import { useConnection } from '@solana/wallet-adapter-react';
import { useDebouncedEffect } from './useDebouncedEffect';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useTonClient } from './ton/useTonClient';
import { Stack } from 'config/ton/wrappers/stack';
import { Address, Dictionary } from '@ton/core';
import { stackContractAddress } from 'config/ton';
import { getStorage, STORAGE_TON_SEQNO } from 'utils/storageUtils';
import { isDev } from 'config/common';
import {
  LsdTokenMaster,
  metadataDictionaryValue,
  toMetadataKey,
} from 'config/ton/wrappers/lsdTokenMaster';
import { useRouter } from 'next/router';

export interface LsdHistoryItem {
  tokenAddress: string;
  tokenName: string;
}

export function useModuleList(
  eco: AppEco,
  evmLsdTokenConfig?: EvmLsdTokenConfig,
  net?: string
) {
  const { connection } = useConnection();
  const userAddress = useUserAddress(eco);

  const [tonConnectUI] = useTonConnectUI();
  const tonClient = useTonClient();

  const [lsdHistoryList, setLsdHistoryList] = useState<LsdHistoryItem[]>();

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

  const updateSolList = useCallback(async () => {
    if (!userAddress) {
      return;
    }
    const publicKey = new PublicKey(userAddress);
    let stakeManagerSeed;
    let i = 0;
    let stakeManagerPubkey;
    let stakeManagerAddresses = [];
    while (true) {
      stakeManagerSeed = `stake_manager_seed_${i}`;
      stakeManagerPubkey = await PublicKey.createWithSeed(
        publicKey,
        stakeManagerSeed,
        new PublicKey(solanaPrograms.lsdProgramId)
      );

      const existAccountInfo = await connection.getAccountInfo(
        stakeManagerPubkey
      );
      if (!existAccountInfo) {
        break;
      }
      stakeManagerAddresses.push(stakeManagerPubkey.toString());
      i++;
    }

    const resList: LsdHistoryItem[] = [];
    stakeManagerAddresses.forEach((address) => {
      resList.push({ tokenAddress: address, tokenName: 'SOL LST' });
    });
    setLsdHistoryList(resList);
  }, [userAddress, connection]);

  const updateTonList = useCallback(async () => {
    if (!userAddress || !tonClient) return;
    try {
      const stack = tonClient.open(
        new Stack(Address.parse(stackContractAddress))
      );

      const seqNoStr = getStorage(STORAGE_TON_SEQNO);
      const seqNo = seqNoStr === null ? 0 : Number(seqNoStr);

      const contractAddresses = await stack.getContractAddresses(
        Address.parse(userAddress),
        BigInt(seqNo)
      );
      const lsdTokenMaster = tonClient.open(
        new LsdTokenMaster(contractAddresses.lsdTokenMaster)
      );

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

      const tokenName = metadata.get(toMetadataKey('name')) ?? '';

      setLsdHistoryList([
        {
          tokenAddress: contractAddresses.lsdTokenMaster.toString({
            testOnly: isDev(),
          }),
          tokenName: tokenName ?? 'TON LST',
        },
      ]);
    } catch (err) {
      console.log(err);
      setLsdHistoryList([{ tokenAddress: userAddress, tokenName: 'TON LST' }]);
    }
  }, [userAddress, tonConnectUI, tonClient]);

  useDebouncedEffect(
    () => {
      if (eco === AppEco.Eth) {
        updateEthList();
      } else if (eco === AppEco.Evm) {
        updateEvmList();
      } else if (eco === AppEco.Lrt) {
        updateLrtList();
      } else if (eco === AppEco.Cosmos) {
        updateNeurtonList();
      } else if (eco === AppEco.Sol) {
        updateSolList();
      } else if (eco === AppEco.Ton) {
        updateTonList();
      }
    },
    [
      eco,
      updateEthList,
      updateEvmList,
      updateLrtList,
      updateNeurtonList,
      updateSolList,
      updateTonList,
      net,
    ],
    1000
  );

  return { lsdHistoryList };
}

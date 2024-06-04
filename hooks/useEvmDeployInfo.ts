import {
  getLsdTokenContractAbi,
  getNetworkProposalContractAbi,
} from 'config/eth/contract';
import {
  evmLsdTokens,
  getEvmFactoryAbi,
  getEvmStakeManagerAbi,
} from 'config/evm';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEthWeb3, getWeb3 } from 'utils/web3Utils';
import { useAppSelector } from './common';

export interface EvmDeployInfo {
  ownerAddress: string;
  lsdTokenAddress: string;
  stakeManagerAddress: string;
  stakePoolAddress: string;
  voters: string[];
  lsdTokenName: string;
}

export const useEvmDeployInfo = (tokenSymbol: string) => {
  const { metaMaskAccount } = useAppSelector((state) => state.wallet);

  const lsdTokenConfig = useMemo(() => {
    const matchedLsdToken = evmLsdTokens.find(
      (item) => item.symbol === tokenSymbol
    );
    return matchedLsdToken || evmLsdTokens[0];
  }, [tokenSymbol]);

  const [deployInfo, setDeployInfo] = useState<EvmDeployInfo | undefined>(
    undefined
  );
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchDeployInfo = useCallback(async () => {
    try {
      const web3 = getWeb3(lsdTokenConfig.rpc);
      const contract = new web3.eth.Contract(
        getEvmFactoryAbi(),
        lsdTokenConfig.factoryContract,
        { from: metaMaskAccount }
      );

      const lsdTokensOfCreater = await contract.methods
        .lsdTokensOfCreater(metaMaskAccount)
        .call();
      if (
        !Array.isArray(lsdTokensOfCreater) ||
        lsdTokensOfCreater.length === 0
      ) {
        setFetchLoading(false);
        return;
      }

      const latestLsdToken = lsdTokensOfCreater[lsdTokensOfCreater.length - 1];
      const networkContractsOfLsdToken = await contract.methods
        .networkContractsOfLsdToken(latestLsdToken)
        .call();
      console.log({ networkContractsOfLsdToken });
      if (!networkContractsOfLsdToken) {
        setFetchLoading(false);
        return;
      }

      const stakeManagerContract = new web3.eth.Contract(
        getEvmStakeManagerAbi(),
        networkContractsOfLsdToken._stakeManager
      );
      let _voters: string[] = [];
      _voters = await stakeManagerContract.methods
        .getValidatorsOf(networkContractsOfLsdToken._stakePool)
        .call();

      console.log({ _voters });

      const ownerAddress = await stakeManagerContract.methods.owner().call();

      const lsdTokenContract = new web3.eth.Contract(
        getLsdTokenContractAbi(),
        latestLsdToken,
        { from: metaMaskAccount }
      );
      const lsdTokenName = await lsdTokenContract.methods.symbol().call();

      setDeployInfo({
        ownerAddress: ownerAddress + '',
        lsdTokenAddress: latestLsdToken,
        voters: _voters,
        lsdTokenName,
        stakeManagerAddress: networkContractsOfLsdToken._stakeManager,
        stakePoolAddress: networkContractsOfLsdToken._stakePool,
      });
      setFetchLoading(false);
    } catch (err: any) {
      console.error(err);
    }
  }, [metaMaskAccount, lsdTokenConfig.factoryContract, lsdTokenConfig.rpc]);

  useEffect(() => {
    fetchDeployInfo();
  }, [fetchDeployInfo]);

  return { fetchLoading, deployInfo };
};

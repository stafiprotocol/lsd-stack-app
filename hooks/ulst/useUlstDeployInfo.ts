import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWeb3 } from 'utils/web3Utils';
import { useAppSelector } from '../common';
import {
  getUlstFactoryAbi,
  getUlstLsdTokenAbi,
  getUlstStakeManagerAbi,
  ulstConfig,
} from 'config/ulst';

export interface EvmDeployInfo {
  ownerAddress: string;
  lsdTokenAddress: string;
  stakeManagerAddress: string;
  stakePoolAddress: string;
  lsdTokenName: string;
}

export const useUlstDeployInfo = () => {
  const { metaMaskAccount } = useAppSelector((state) => state.wallet);

  const [deployInfo, setDeployInfo] = useState<EvmDeployInfo | undefined>(
    undefined
  );
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchDeployInfo = useCallback(async () => {
    if (!metaMaskAccount) {
      return;
    }
    try {
      const web3 = getWeb3(ulstConfig.rpc);
      const contract = new web3.eth.Contract(
        getUlstFactoryAbi(),
        ulstConfig.factoryContract,
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
        .getNetworkContracts(latestLsdToken)
        .call();
      // console.log({ networkContractsOfLsdToken });
      if (!networkContractsOfLsdToken) {
        setFetchLoading(false);
        return;
      }

      const stakeManagerContract = new web3.eth.Contract(
        getUlstStakeManagerAbi(),
        networkContractsOfLsdToken._stakeManager
      );

      const ownerAddress = await stakeManagerContract.methods.owner().call();

      const lsdTokenContract = new web3.eth.Contract(
        getUlstLsdTokenAbi(),
        latestLsdToken,
        { from: metaMaskAccount }
      );
      const lsdTokenName = await lsdTokenContract.methods.symbol().call();

      setDeployInfo({
        ownerAddress: ownerAddress + '',
        lsdTokenAddress: latestLsdToken,
        lsdTokenName,
        stakeManagerAddress: networkContractsOfLsdToken._stakeManager,
        stakePoolAddress: networkContractsOfLsdToken._stakePool,
      });
      setFetchLoading(false);
    } catch (err: any) {
      console.error(err);
    }
  }, [
    metaMaskAccount,
    ulstConfig.factoryContract,
    ulstConfig.rpc,
    ulstConfig.symbol,
  ]);

  useEffect(() => {
    fetchDeployInfo();
  }, [fetchDeployInfo]);

  return { fetchLoading, deployInfo };
};

import {
  getLrtFactoryContract,
  getLrtStakeManagerAbi,
  getLrtStakePoolAbi,
  getLrtTokenContractAbi,
} from 'config/lrt/contract';
import { useCallback, useEffect, useState } from 'react';
import { getEthWeb3 } from 'utils/web3Utils';
import { useAppSelector } from './common';

export interface LrtDeployInfo {
  ownerAddress: string;
  operatorAddress: string;
  lrtTokenAddress: string;
  stakeManagerAddress: string;
  stakePoolAddress: string;
  lrtTokenName: string;
}

export const useLrtDeployInfo = () => {
  const { metaMaskAccount } = useAppSelector((state) => state.wallet);

  const [deployInfo, setDeployInfo] = useState<LrtDeployInfo | undefined>(
    undefined
  );
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchDeployInfo = useCallback(async () => {
    try {
      const web3 = getEthWeb3();
      const contract = new web3.eth.Contract(
        getLrtFactoryContract().abi,
        getLrtFactoryContract().address,
        { from: metaMaskAccount }
      );

      const lrdTokensOfCreater = await contract.methods
        .lrdTokensOfCreater(metaMaskAccount)
        .call();
      if (
        !Array.isArray(lrdTokensOfCreater) ||
        lrdTokensOfCreater.length === 0
      ) {
        setFetchLoading(false);
        return;
      }

      const latestLrdToken = lrdTokensOfCreater[lrdTokensOfCreater.length - 1];
      const networkContractsOfLrdToken = await contract.methods
        .networkContractsOfLrdToken(latestLrdToken)
        .call();
      if (!networkContractsOfLrdToken) {
        setFetchLoading(false);
        return;
      }

      const lrdTokenContract = new web3.eth.Contract(
        getLrtTokenContractAbi(),
        latestLrdToken,
        { from: metaMaskAccount }
      );
      const lsdTokenName = await lrdTokenContract.methods.symbol().call();
      // const ownerAddress = await lrdTokenContract.methods.owner().call();

      const lrdStakeManagerContract = new web3.eth.Contract(
        getLrtStakeManagerAbi(),
        networkContractsOfLrdToken._stakeManager,
        { from: metaMaskAccount }
      );
      const ownerAddress = await lrdStakeManagerContract.methods.owner().call();

      const lrdStakePoolContract = new web3.eth.Contract(
        getLrtStakePoolAbi(),
        networkContractsOfLrdToken._stakePool,
        { from: metaMaskAccount }
      );
      const operatorAddress = await lrdStakePoolContract.methods
        .operatorAddress()
        .call();

      setDeployInfo({
        ownerAddress: ownerAddress + '',
        operatorAddress: operatorAddress + '',
        lrtTokenAddress: latestLrdToken,
        stakePoolAddress: networkContractsOfLrdToken._stakePool,
        stakeManagerAddress: networkContractsOfLrdToken._stakeManager,
        lrtTokenName: lsdTokenName,
      });
      setFetchLoading(false);
    } catch (err: any) {
      console.error(err);
    }
  }, [metaMaskAccount]);

  useEffect(() => {
    fetchDeployInfo();
  }, [fetchDeployInfo]);

  return { fetchLoading, deployInfo };
};

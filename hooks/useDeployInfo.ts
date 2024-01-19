import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from './common';
import { getEthWeb3 } from 'utils/web3Utils';
import {
  getFactoryContract,
  getLsdTokenContractAbi,
  getNetworkProposalContractAbi,
} from 'config/contract';
import { RelayType } from 'interfaces/common';

export interface DeployInfo {
  ownerAddress: string;
  lsdTokenAddress: string;
  feePoolAddress: string;
  networkBalancesAddress: string;
  networkProposalAddress: string;
  nodeDepositAddress: string;
  userDepositAddress: string;
  networkWithdrawAddress: string;
  voters: string[];
  lsdTokenName: string;
}

export const useDeployInfo = (relayType: RelayType) => {
  const { metaMaskAccount } = useAppSelector((state) => state.wallet);

  const [deployInfo, setDeployInfo] = useState<DeployInfo | undefined>(
    undefined
  );
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchDeployInfo = useCallback(async () => {
    try {
      const web3 = getEthWeb3();
      const contract = new web3.eth.Contract(
        getFactoryContract().abi,
        getFactoryContract().address,
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
      if (!networkContractsOfLsdToken) {
        setFetchLoading(false);
        return;
      }

      const proposalContract = new web3.eth.Contract(
        getNetworkProposalContractAbi(),
        networkContractsOfLsdToken._networkProposal,
        { from: metaMaskAccount }
      );
      let _voters: string[] = [];
      if (relayType === 'customize') {
        _voters = await proposalContract.methods.getVoters().call();
      } else {
        _voters = await contract.methods.getEntrustWithVoters().call();
      }
      const voters = Array.isArray(_voters) ? _voters : [];

      const ownerAddress = await proposalContract.methods.admin().call();

      const lsdTokenContract = new web3.eth.Contract(
        getLsdTokenContractAbi(),
        latestLsdToken,
        { from: metaMaskAccount }
      );
      const lsdTokenName = await lsdTokenContract.methods.symbol().call();

      setDeployInfo({
        ownerAddress: ownerAddress + '',
        lsdTokenAddress: latestLsdToken,
        feePoolAddress: networkContractsOfLsdToken._feePool,
        networkBalancesAddress: networkContractsOfLsdToken._networkBalances,
        networkProposalAddress: networkContractsOfLsdToken._networkProposal,
        networkWithdrawAddress: networkContractsOfLsdToken._networkWithdraw,
        nodeDepositAddress: networkContractsOfLsdToken._nodeDeposit,
        userDepositAddress: networkContractsOfLsdToken._userDeposit,
        voters,
        lsdTokenName,
      });
      setFetchLoading(false);
    } catch (err: any) {
      console.error(err);
    }
  }, [metaMaskAccount]);

  useEffect(() => {
    fetchDeployInfo();
  }, [metaMaskAccount]);

  return { fetchLoading, deployInfo };
};

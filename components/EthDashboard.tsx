import { Popover } from '@mui/material';
import classNames from 'classnames';
import {
  getEthNodeDepositContractAbi,
  getEthUserDepositContractAbi,
  getEthWithdrawContractAbi,
  getFactoryContract,
  getLsdTokenContractAbi,
  getNetworkBalanceContractAbi,
  getNetworkProposalContractAbi,
} from 'config/eth/contract';
import { getEtherScanAccountUrl } from 'config/explorer';
import { robotoBold, robotoSemiBold } from 'config/font';
import { useWalletAccount } from 'hooks/useWalletAccount';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import Link from 'next/link';
import edit from 'public/images/edit.svg';
import cup from 'public/images/cup.svg';
import eth from 'public/images/tokens/eth.svg';
import { useCallback, useEffect, useState } from 'react';
import { formatNumber } from 'utils/numberUtils';
import { getEthWeb3 } from 'utils/web3Utils';
import { formatEther } from 'viem';
import { DataLoading } from './common/DataLoading';
import { Icomoon } from './icon/Icomoon';
import { formatDuration } from 'utils/timeUtils';
import { UpdateNodePlatformFeeModal } from './modal/eth/UpdateNodePlatformFeeModal';
import { useConnect } from 'wagmi';
import { getEthereumChainId } from 'config/eth/env';
import { UpdateStackFeeModal } from './modal/eth/UpdateStackFeeModal';
import { UpdateTrustEnabledModal } from './modal/eth/UpdateTrustEnabledModal';
import { UpdateSoloEnabledModal } from './modal/eth/UpdateSoloEnabledModal';
import { UpdateSoloDepositModal } from './modal/eth/UpdateSoloDepositModal';
import { UpdateMinDepositModal } from './modal/eth/UpdateMinDepositModal';
import { UpdateVotersModal } from './modal/eth/UpdateVotersModal';
import { UpdateRewardPeriodModal } from './modal/eth/updateRewardPeriodModal';
import { EmptyContent } from './common/EmptyContent';

export const EthDashboard = () => {
  const { metaMaskAccount } = useWalletAccount();
  const [lsdTokens, setLsdTokens] = useState<string[]>([]);

  const updateList = useCallback(async () => {
    try {
      const web3 = getEthWeb3();
      const contract = new web3.eth.Contract(
        getFactoryContract().abi,
        getFactoryContract().address
      );
      const lsdTokensOfCreater = await contract.methods
        .lsdTokensOfCreater(metaMaskAccount)
        .call();
      setLsdTokens(lsdTokensOfCreater);
    } catch (err: any) {
      console.log({ err });
    }
  }, [metaMaskAccount]);

  useEffect(() => {
    updateList();
  }, [updateList]);

  return (
    <div>
      <div className={classNames('text-[.24rem]', robotoSemiBold.className)}>
        My Deployment History
      </div>

      {lsdTokens.length > 0 ? (
        lsdTokens.map((address) => (
          <DashboardItem key={address} address={address} />
        ))
      ) : (
        <div className="mt-[.56rem]">
          <EmptyContent />
        </div>
      )}

      <div className="mt-[.8rem] flex flex-col items-center">
        <div className="w-[.4rem] h-[.3rem] relative">
          <Image src={cup} alt="cup" layout="fill" />
        </div>

        <div
          className={classNames(
            robotoBold.className,
            'text-[.14rem] text-text2 mt-[.16rem]'
          )}
        >
          Need Help?
        </div>

        <div className={classNames('text-[.14rem] text-text2 mt-[.1rem]')}>
          Feel free to{' '}
          <Link href="https://discord.com/invite/jB77etn" target="_blank">
            <span className="cursor-pointer underline">contact us</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

interface DashboardInfo {
  symbol: string;
  _feePool: string;
  _userDeposit: string;
  _networkProposal: string;
  _networkWithdraw: string;
  _nodeDeposit: string;
  _networkBalances: string;
  _voters: string[];
  _admin: string;
  formatNodeCommissionFee: string;
  formatPlatformCommissionFee: string;
  formatStackCommissionFee: string;
  formatMinDeposit: string;
  trustNodeDepositEnabled: boolean;
  soloNodeDepositEnabled: boolean;
  formatSoloNodeDepositAmount: string;
  updateBalancesEpochs: number;
  threshold: number;
  isEntrusted: boolean;
}

const DashboardItem = (props: { address: string }) => {
  const { address } = props;
  const { metaMaskAccount } = useWalletAccount();
  const settingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'setting',
  });
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>();
  const [updateNodeFeeModalOpen, setUpdateNodeFeeModalOpen] = useState(false);
  const [stackFeeModalOpen, setStackFeeModalOpen] = useState(false);
  const [trustEnabledModalOpen, setTrustEnabledModalOpen] = useState(false);
  const [soloEnabledModalOpen, setSoloEnabledModalOpen] = useState(false);
  const [soloDepositModalOpen, setSoloDepositModalOpen] = useState(false);
  const [minDepositModalOpen, setMinDepositModalOpen] = useState(false);
  const [votersModalOpen, setVotersModalOpen] = useState(false);
  const [rewardPeriodModalOpen, setRewardPeriodModalOpen] = useState(false);

  const updateData = useCallback(async () => {
    try {
      const web3 = getEthWeb3();
      const factoryContract = new web3.eth.Contract(
        getFactoryContract().abi,
        getFactoryContract().address
      );

      const entrustedLsdTokens: string[] = await factoryContract.methods
        .getEntrustedLsdTokens()
        .call();

      const isEntrusted = entrustedLsdTokens.includes(address);

      const networkContractsOfLsdToken = await factoryContract.methods
        .networkContractsOfLsdToken(address)
        .call();

      if (!networkContractsOfLsdToken) {
        return;
      }

      const proposalContract = new web3.eth.Contract(
        getNetworkProposalContractAbi(),
        networkContractsOfLsdToken._networkProposal
      );

      const _voters = await proposalContract.methods.getVoters().call();
      const adminAddress = await proposalContract.methods.admin().call();
      const threshold = await proposalContract.methods.threshold().call();

      const lsdTokenContract = new web3.eth.Contract(
        getLsdTokenContractAbi(),
        address
      );
      const tokenSymbol = await lsdTokenContract.methods.symbol().call();
      const networkWithdrawContract = new web3.eth.Contract(
        getEthWithdrawContractAbi(),
        networkContractsOfLsdToken._networkWithdraw
      );
      const nodeCommissionFee = await networkWithdrawContract.methods
        .nodeCommissionRate()
        .call();
      const platformCommissionFee = await networkWithdrawContract.methods
        .platformCommissionRate()
        .call();
      const stackCommissionFee = await networkWithdrawContract.methods
        .stackCommissionRate()
        .call();

      const userDepositContract = new web3.eth.Contract(
        getEthUserDepositContractAbi(),
        networkContractsOfLsdToken._userDeposit
      );
      const minDeposit = await userDepositContract.methods.minDeposit().call();

      const nodeDepositContract = new web3.eth.Contract(
        getEthNodeDepositContractAbi(),
        networkContractsOfLsdToken._nodeDeposit
      );
      const trustNodeDepositEnabled = await nodeDepositContract.methods
        .trustNodeDepositEnabled()
        .call();
      const soloNodeDepositEnabled = await nodeDepositContract.methods
        .soloNodeDepositEnabled()
        .call();
      const soloNodeDepositAmount = await nodeDepositContract.methods
        .soloNodeDepositAmount()
        .call();

      const networkBalanceContract = new web3.eth.Contract(
        getNetworkBalanceContractAbi(),
        networkContractsOfLsdToken._networkBalances
      );
      const updateBalancesEpochs = await networkBalanceContract.methods
        .updateBalancesEpochs()
        .call();

      setDashboardInfo({
        symbol: tokenSymbol,
        _admin: adminAddress,
        _voters: [..._voters],
        _feePool: networkContractsOfLsdToken._feePool,
        _userDeposit: networkContractsOfLsdToken._userDeposit,
        _networkProposal: networkContractsOfLsdToken._networkProposal,
        _networkWithdraw: networkContractsOfLsdToken._networkWithdraw,
        _nodeDeposit: networkContractsOfLsdToken._nodeDeposit,
        _networkBalances: networkContractsOfLsdToken._networkBalances,
        formatNodeCommissionFee: formatNumber(
          (Number(formatEther(BigInt(nodeCommissionFee))) * 100).toString(),
          {
            decimals: 2,
            fixedDecimals: false,
          }
        ),
        formatPlatformCommissionFee: formatNumber(
          (Number(formatEther(BigInt(platformCommissionFee))) * 100).toString(),
          {
            decimals: 2,
            fixedDecimals: false,
          }
        ),
        formatStackCommissionFee: formatNumber(
          (Number(formatEther(BigInt(stackCommissionFee))) * 100).toString(),
          {
            decimals: 2,
            fixedDecimals: false,
          }
        ),
        formatMinDeposit: formatNumber(
          formatEther(BigInt(minDeposit)).toString(),
          {
            decimals: 6,
            fixedDecimals: false,
          }
        ),
        trustNodeDepositEnabled,
        soloNodeDepositEnabled,
        formatSoloNodeDepositAmount: formatNumber(
          formatEther(BigInt(soloNodeDepositAmount)).toString(),
          {
            decimals: 6,
            fixedDecimals: false,
          }
        ),
        updateBalancesEpochs,
        threshold,
        isEntrusted,
      });
    } catch (err: any) {
      console.log({ err });
    }
  }, [address]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  const { connectors, connectAsync } = useConnect();

  const connectWallet = async () => {
    const metamaskConnector = connectors.find((c) => c.name === 'MetaMask');
    if (!metamaskConnector) {
      return;
    }
    try {
      await connectAsync({
        chainId: getEthereumChainId(),
        connector: metamaskConnector,
      });
    } catch (err: any) {
      if (err.code === 4001) {
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div className="mt-[.24rem] bg-bg2 rounded-[.12rem] border border-[#ffffff] p-[.24rem]">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-[.34rem] h-[.34rem] relative mr-[.12rem]">
            <Image src={eth} layout="fill" alt="icon" />
          </div>

          {dashboardInfo ? (
            <Link href={getEtherScanAccountUrl(address)} target="_blank">
              <div className="flex items-center cursor-pointer">
                <div
                  className={classNames(
                    'mr-[.12rem]  text-[.24rem]',
                    robotoSemiBold.className
                  )}
                >
                  {dashboardInfo.symbol}
                </div>

                <Icomoon icon="share" size=".12rem" />
              </div>
            </Link>
          ) : (
            <DataLoading height=".14rem" width=".4rem" />
          )}
        </div>

        <div
          className={classNames(
            'cursor-pointer ml-[.3rem] w-[.42rem] h-[.42rem] flex items-center justify-center rounded-[.12rem]',
            settingsPopupState.isOpen ? 'bg-color-selected' : ''
          )}
          {...bindTrigger(settingsPopupState)}
        >
          <Icomoon icon="more" size=".24rem" color="#6C86AD" />
        </div>
      </div>

      <div
        className="mt-[.17rem] grid text-[.14rem] items-start"
        style={{
          gridTemplateColumns: '45% 1px 55%',
        }}
      >
        <div
          className="grid gap-y-[.24rem]"
          style={{
            gridTemplateColumns: '50% 50%',
          }}
        >
          <div className="flex items-center">
            <div className="text-text2">Node Fee Commission:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatNodeCommissionFee : '--'}%
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Solo Node Enable:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo
                ? dashboardInfo.soloNodeDepositEnabled
                  ? 'Y'
                  : 'N'
                : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Platform Fee Commission:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatPlatformCommissionFee : '--'}
              %
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Solo Node Deposit Amount:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatSoloNodeDepositAmount : '--'}{' '}
              ETH
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Stack Fee Commission:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatStackCommissionFee : '--'}%
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Reward Update Period:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo
                ? formatDuration(
                    dashboardInfo.updateBalancesEpochs * 36 * 12 * 1000
                  )
                : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Min Deposit Amount:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatMinDeposit : '--'} ETH
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Threshold of Voters:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.threshold : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Trust Node Enable:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo
                ? dashboardInfo.trustNodeDepositEnabled
                  ? 'Y'
                  : 'N'
                : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Entrusted Token:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? (dashboardInfo.isEntrusted ? 'Y' : 'N') : '--'}
            </div>
          </div>
        </div>

        <div className="mt-[-.4rem] self-stretch w-[1px] bg-[#6C86AD33]" />

        <div
          className="grid gap-y-[.24rem] pl-[.38rem]"
          style={{
            gridTemplateColumns: '40% 40% 20%',
          }}
        >
          <div>
            <div className="flex items-center">
              <Link href={getEtherScanAccountUrl(address)} target="_blank">
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">LSD Token Address</div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getEtherScanAccountUrl(getFactoryContract().address)}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    LSD Factory Address
                  </div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getEtherScanAccountUrl(metaMaskAccount || '')}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">Owner Address</div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getEtherScanAccountUrl(dashboardInfo?._feePool || '')}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">Fee Pool Address</div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getEtherScanAccountUrl(dashboardInfo?._userDeposit || '')}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    User Deposit Address
                  </div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <Link
                href={getEtherScanAccountUrl(
                  dashboardInfo?._networkProposal || ''
                )}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    Network Proposal Address
                  </div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getEtherScanAccountUrl(
                  dashboardInfo?._networkWithdraw || ''
                )}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    Network Withdraw Address
                  </div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getEtherScanAccountUrl(dashboardInfo?._nodeDeposit || '')}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    Node Deposit Address
                  </div>

                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getEtherScanAccountUrl(
                  dashboardInfo?._networkBalances || ''
                )}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    Network Balances Address
                  </div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>
          </div>

          <div className="max-h-[1.62rem] overflow-auto">
            <div className="text-text2">Voters:</div>

            {dashboardInfo?._voters?.map((voter, index) => (
              <div key={index} className="flex items-center mt-[.24rem]">
                <Link href={getEtherScanAccountUrl(voter)} target="_blank">
                  <div className="flex item-center cursor-pointer">
                    <div className="text-link mr-[.06rem]">
                      Voter-{index + 1}
                    </div>
                    <Icomoon icon="share" size=".12rem" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Popover
        {...bindPopover(settingsPopupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        elevation={0}
        sx={{
          marginTop: '.15rem',
          '& .MuiPopover-paper': {
            background: '#ffffff80',
            border: '0.01rem solid #FFFFFF',
            backdropFilter: 'blur(.4rem)',
            borderRadius: '.3rem',
          },
          '& .MuiTypography-root': {
            padding: '0px',
          },
          '& .MuiBox-root': {
            padding: '0px',
          },
        }}
      >
        <div
          className={classNames(
            'p-[.16rem] w-[2.6rem] pl-[.16rem] pr-[.24rem] py-[.04rem] leading-tight'
          )}
        >
          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              setUpdateNodeFeeModalOpen(true);
              settingsPopupState.close();
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Node & Platform Fees
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setStackFeeModalOpen(true);
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Stack Fee
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setMinDepositModalOpen(true);
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Min Deposit Amount
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setRewardPeriodModalOpen(true);
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Reward Update Period
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setVotersModalOpen(true);
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Voters
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setTrustEnabledModalOpen(true);
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Enable/Disable Trust Node
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setSoloEnabledModalOpen(true);
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Enable/Disable Solo Node
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setSoloDepositModalOpen(true);
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Solo Node Deposit Amount
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>
        </div>
      </Popover>

      <UpdateNodePlatformFeeModal
        contractAddress={dashboardInfo?._networkWithdraw || ''}
        nodeCommissionPlaceholder={
          dashboardInfo ? dashboardInfo.formatNodeCommissionFee : ''
        }
        platformCommissionPlaceholder={
          dashboardInfo ? dashboardInfo.formatPlatformCommissionFee : ''
        }
        open={updateNodeFeeModalOpen}
        close={() => {
          setUpdateNodeFeeModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateStackFeeModal
        contractAddress={dashboardInfo?._networkWithdraw || ''}
        placeholder={
          dashboardInfo ? dashboardInfo.formatStackCommissionFee : ''
        }
        open={stackFeeModalOpen}
        close={() => {
          setStackFeeModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateTrustEnabledModal
        contractAddress={dashboardInfo?._nodeDeposit || ''}
        defaultEnabled={
          dashboardInfo ? dashboardInfo.trustNodeDepositEnabled : false
        }
        open={trustEnabledModalOpen}
        close={() => {
          setTrustEnabledModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateSoloEnabledModal
        contractAddress={dashboardInfo?._nodeDeposit || ''}
        defaultEnabled={
          dashboardInfo ? dashboardInfo.soloNodeDepositEnabled : false
        }
        open={soloEnabledModalOpen}
        close={() => {
          setSoloEnabledModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateSoloDepositModal
        contractAddress={dashboardInfo?._nodeDeposit || ''}
        placeholder={
          dashboardInfo ? dashboardInfo.formatSoloNodeDepositAmount : ''
        }
        open={soloDepositModalOpen}
        close={() => {
          setSoloDepositModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateMinDepositModal
        contractAddress={dashboardInfo?._userDeposit || ''}
        placeholder={dashboardInfo ? dashboardInfo.formatMinDeposit : ''}
        open={minDepositModalOpen}
        close={() => {
          setMinDepositModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateVotersModal
        adminAddres={dashboardInfo?._admin || ''}
        contractAddress={dashboardInfo?._networkProposal || ''}
        currentThreshold={
          dashboardInfo ? dashboardInfo.threshold.toString() : ''
        }
        currentVoteNumber={
          dashboardInfo ? dashboardInfo._voters.length.toString() : ''
        }
        open={votersModalOpen}
        close={() => {
          setVotersModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateRewardPeriodModal
        contractAddress={dashboardInfo?._networkBalances || ''}
        placeholder={
          dashboardInfo ? dashboardInfo.updateBalancesEpochs.toString() : ''
        }
        open={rewardPeriodModalOpen}
        close={() => {
          setRewardPeriodModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />
    </div>
  );
};

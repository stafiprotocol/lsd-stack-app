import { Popover } from '@mui/material';
import classNames from 'classnames';
import {
  getFactoryContract,
  getLsdTokenContractAbi,
} from 'config/eth/contract';
import { getEthereumChainId } from 'config/eth/env';
import { getEtherScanAccountUrl } from 'config/explorer';
import { robotoBold, robotoSemiBold } from 'config/font';
import {
  getLrtFactoryContract,
  getLrtStakeManagerAbi,
  getLrtStakePoolAbi,
  getLrtTokenContractAbi,
} from 'config/lrt/contract';
import { useWalletAccount } from 'hooks/useWalletAccount';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import Link from 'next/link';
import cup from 'public/images/cup.svg';
import edit from 'public/images/edit.svg';
import eth from 'public/images/tokens/eth.svg';
import { useCallback, useEffect, useState } from 'react';
import { formatNumber } from 'utils/numberUtils';
import { formatDuration } from 'utils/timeUtils';
import { getEthWeb3 } from 'utils/web3Utils';
import { formatEther } from 'viem';
import { useConnect, useSwitchNetwork } from 'wagmi';
import { DataLoading } from './common/DataLoading';
import { EmptyContent } from './common/EmptyContent';
import { Icomoon } from './icon/Icomoon';
import { UpdateLrtMinDepositModal } from './modal/lrt/UpdateLrtMinDepositModal';
import { UpdateLrtStackFeeModal } from './modal/lrt/UpdateLrtStackFeeModal';
import { UpdateLrtLsdManagerModal } from './modal/lrt/UpdateLrtLsdManagerModal';
import { UpdateLrtOperatorModal } from './modal/lrt/UpdateLrtOperatorModal';
import { LstItem } from 'interfaces/common';
import { UpdateLstForStakeModal } from './modal/lrt/UpdateLstForStakeModal';
import { UpdateSupportedLstsModal } from './modal/lrt/UpdateSupportedLstsModal';
import { UpdateLrtPlatformFeeModal } from './modal/lrt/UpdateLrtPlatformFeeModal';
import snackbarUtil from 'utils/snackbarUtils';
import { getInjectedConnector } from 'utils/commonUtils';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { PrimaryLoading } from './common/PrimaryLoading';

export const LrtDashboard = () => {
  const { metaMaskAccount } = useWalletAccount();

  const listQuery: UseQueryResult<string[] | undefined> = useQuery({
    queryKey: ['GetLrtDashboardList', metaMaskAccount],
    enabled: !!metaMaskAccount,
    queryFn: async () => {
      try {
        const web3 = getEthWeb3();
        const contract = new web3.eth.Contract(
          getLrtFactoryContract().abi,
          getLrtFactoryContract().address
        );
        const lrdTokensOfCreator = await contract.methods
          .lrdTokensOfCreator(metaMaskAccount)
          .call();
        return lrdTokensOfCreator;
      } catch (err: any) {
        console.log({ err });
      }
    },
  });

  return (
    <div>
      {!listQuery.isLoading &&
        (!!listQuery.data?.length ? (
          listQuery.data.map((address) => (
            <DashboardItem key={address} address={address} />
          ))
        ) : (
          <div className="mt-[.56rem]">
            <EmptyContent />
          </div>
        ))}

      {listQuery.isLoading && (
        <div className="pt-[.56rem] flex justify-center">
          <PrimaryLoading size=".56rem" />
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
  _owner: string;
  _operator: string;
  _stakePool: string;
  _stakeManager: string;
  _lsdManager: string;
  _supportedLsts: LstItem[];
  _lstForStakeEth: string;
  _poolAddr: string;
  formatPlatformFeeCommission: string;
  formatFactoryCommissionRate: string;
  eraSeconds: string;
  unbondingDuration: string;
  formatMinStakeAmount: string;
  latestEra: string;
}

const DashboardItem = (props: { address: string }) => {
  const { address } = props;
  const { metaMaskAccount } = useWalletAccount();
  const settingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'setting',
  });
  const linksPopupState = usePopupState({
    variant: 'popover',
    popupId: 'links',
  });
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>();
  const [stackFeeModalOpen, setStackFeeModalOpen] = useState(false);
  const [platformFeeModalOpen, setPlatformFeeModalOpen] = useState(false);
  const [minDepositModalOpen, setMinDepositModalOpen] = useState(false);
  const [updateLsdManagerModalOpen, setUpdateLsdManagerModalOpen] =
    useState(false);
  const [updateOperatorModalOpen, setUpdateOperatorModalOpen] = useState(false);
  const [updateLstForStakeModalOpen, setUpdateLstForStakeModalOpen] =
    useState(false);
  const [updateSupportedLstsModalOpen, setUpdateSupportedLstsModalOpen] =
    useState(false);

  const updateData = useCallback(async () => {
    try {
      const web3 = getEthWeb3();
      const factoryContract = new web3.eth.Contract(
        getLrtFactoryContract().abi,
        getLrtFactoryContract().address
      );

      const networkContractsOfLrdToken = await factoryContract.methods
        .networkContractsOfLrdToken(address)
        .call();

      if (!networkContractsOfLrdToken) {
        return;
      }

      const lrdTokenContract = new web3.eth.Contract(
        getLrtTokenContractAbi(),
        address
      );
      const tokenSymbol = await lrdTokenContract.methods.symbol().call();
      // const ownerAddress = await lrdTokenContract.methods.owner().call();

      const lrdStakeManagerContract = new web3.eth.Contract(
        getLrtStakeManagerAbi(),
        networkContractsOfLrdToken._stakeManager
      );
      const ownerAddress = await lrdStakeManagerContract.methods.owner().call();
      const lsdManager = await lrdStakeManagerContract.methods
        .lsdManager()
        .call();
      const lstForStakeEth = await lrdStakeManagerContract.methods
        .lstForStakeEth()
        .call();

      const lrdStakePoolContract = new web3.eth.Contract(
        getLrtStakePoolAbi(),
        networkContractsOfLrdToken._stakePool
      );
      const operatorAddress = await lrdStakePoolContract.methods
        .operatorAddress()
        .call();

      const bondedPools = await lrdStakeManagerContract.methods
        .getBondedPools()
        .call();

      const supportedLsts = await lrdStakeManagerContract.methods
        .getSupportedLsts()
        .call();

      const lstDetailRequests = supportedLsts.map((address: string) => {
        return (async () => {
          try {
            let contract = new web3.eth.Contract(
              getLsdTokenContractAbi(),
              address
            );
            const symbol = await contract.methods.symbol().call();
            return [symbol];
          } catch (err: unknown) {
            console.log(err);
          }
        })();
      });

      const lstDetails = await Promise.all(lstDetailRequests);
      const lsts: LstItem[] = [];
      supportedLsts.forEach((address: string, index: number) => {
        if (lstDetails[index]) {
          lsts.push({
            address,
            symbol: lstDetails[index][0],
          });
        }
      });

      const protocolFeeCommission = await lrdStakeManagerContract.methods
        .protocolFeeCommission()
        .call();
      const factoryCommissionRate = await lrdStakeManagerContract.methods
        .factoryCommissionRate()
        .call();
      const eraSeconds = await lrdStakeManagerContract.methods
        .eraSeconds()
        .call();
      const unbondingDuration = await lrdStakeManagerContract.methods
        .unbondingDuration()
        .call();
      const minStakeAmount = await lrdStakeManagerContract.methods
        .minStakeAmount()
        .call();
      const latestEra = await lrdStakeManagerContract.methods
        .latestEra()
        .call();

      setDashboardInfo({
        symbol: tokenSymbol,
        _owner: ownerAddress,
        _operator: operatorAddress,
        _stakePool: networkContractsOfLrdToken._stakePool,
        _stakeManager: networkContractsOfLrdToken._stakeManager,
        _lsdManager: lsdManager,
        _supportedLsts: lsts,
        _lstForStakeEth: lstForStakeEth,
        _poolAddr: bondedPools[0],
        formatPlatformFeeCommission: formatNumber(
          Number(
            formatEther(BigInt(protocolFeeCommission) * BigInt(100))
          ).toString(),
          {
            decimals: 2,
            fixedDecimals: false,
            roundMode: 'round',
          }
        ),
        formatFactoryCommissionRate: formatNumber(
          Number(
            formatEther(BigInt(factoryCommissionRate) * BigInt(100))
          ).toString(),
          {
            decimals: 2,
            fixedDecimals: false,
            roundMode: 'round',
          }
        ),
        eraSeconds,
        unbondingDuration,
        formatMinStakeAmount: formatNumber(
          formatEther(BigInt(minStakeAmount)).toString(),
          {
            decimals: 6,
            fixedDecimals: false,
          }
        ),
        latestEra,
      });
    } catch (err: any) {
      console.log({ err });
    }
  }, [address]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  const { connectors, connectAsync } = useConnect();
  const { switchNetworkAsync } = useSwitchNetwork();

  const connectWallet = async () => {
    if (metaMaskAccount && switchNetworkAsync) {
      await switchNetworkAsync(getEthereumChainId());
      return;
    }
    const metamaskConnector = getInjectedConnector(connectors);
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
    <div className="mt-[.24rem] bg-bg2 rounded-[.12rem] border border-[#ffffff] px-[.24rem] pt-[.32rem] pb-[.4rem]">
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

        <div className="flex items-center">
          <div
            className={classNames(
              'cursor-pointer ml-[.3rem] w-[.42rem] h-[.42rem] flex items-center justify-center rounded-[.12rem]',
              settingsPopupState.isOpen
                ? 'bg-color-selected'
                : 'bg-color-bgPage'
            )}
            {...(dashboardInfo ? bindTrigger(settingsPopupState) : {})}
          >
            <div className="w-[.15rem] h-[.15rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className={classNames(
              'cursor-pointer ml-[.16rem] w-[.42rem] h-[.42rem] flex items-center justify-center rounded-[.12rem]',
              linksPopupState.isOpen ? 'bg-color-selected' : 'bg-color-bgPage'
            )}
            {...(dashboardInfo ? bindTrigger(linksPopupState) : {})}
          >
            <Icomoon icon="more" size=".15rem" color="#6C86AD" />
          </div>
        </div>
      </div>

      <div
        className="mt-[.17rem] grid text-[.14rem] items-start"
        style={{
          gridTemplateColumns: '100%',
        }}
      >
        <div
          className="grid gap-y-[.24rem]"
          style={{
            gridTemplateColumns: '23% 23% 24% 30%',
          }}
        >
          <div className="flex items-center">
            <div className="text-text2">Platform Fee Commission:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatPlatformFeeCommission : '--'}
              %
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Stack Fee Commission:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatFactoryCommissionRate : '--'}
              %
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Min Deposit Amount:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatMinStakeAmount : '--'} ETH
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Era Seconds:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.eraSeconds : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Unbonding Duration:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo
                ? formatDuration(
                    Number(dashboardInfo.unbondingDuration) *
                      Number(dashboardInfo.eraSeconds) *
                      1000
                  )
                : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Latest Era:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.latestEra : '--'}
            </div>
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
            'w-[2.6rem] pl-[.16rem] text-[.14rem] pr-[.24rem] py-[.32rem]'
          )}
        >
          <div
            className="cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._owner !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setStackFeeModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">Stack Fee</div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._owner !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setPlatformFeeModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">Platform Fee</div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._owner !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setMinDepositModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Min Deposit Amount
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._owner !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setUpdateOperatorModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">Operator</div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer items-center justify-between hidden"
            onClick={() => {
              if (dashboardInfo?._owner !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setUpdateLsdManagerModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">LSD Manager</div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._owner !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setUpdateLstForStakeModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              LST for Stake ETH
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._owner !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setUpdateSupportedLstsModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">Supported LSTs</div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>
        </div>
      </Popover>

      <Popover
        {...bindPopover(linksPopupState)}
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
        <div className="w-[2.9rem] max-h-[4.4rem] overflow-auto hide-scrollbar pl-[.16rem] pr-[.24rem] py-[.32rem] text-[.14rem]">
          <Link href={getEtherScanAccountUrl(address)} target="_blank">
            <div className="flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">LRT Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._owner || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Owner Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._operator || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Operator Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._lsdManager || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">LSD Manager Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(getFactoryContract().address)}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">LRT Factory Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._stakePool || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Stake Pool Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._stakeManager || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Stake Manager Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._lstForStakeEth || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">LST for Stake ETH</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          {dashboardInfo?._supportedLsts?.map((lst, index) => (
            <div key={index}>
              <Link href={getEtherScanAccountUrl(lst.address)} target="_blank">
                <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">{lst.symbol}</div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Popover>

      <UpdateLrtStackFeeModal
        contractAddress={dashboardInfo?._stakeManager || ''}
        placeholder={
          dashboardInfo ? dashboardInfo.formatFactoryCommissionRate : ''
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

      <UpdateLrtPlatformFeeModal
        contractAddress={dashboardInfo?._stakeManager || ''}
        placeholder={
          dashboardInfo ? dashboardInfo.formatPlatformFeeCommission : ''
        }
        open={platformFeeModalOpen}
        close={() => {
          setPlatformFeeModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateLrtMinDepositModal
        contractAddress={dashboardInfo?._stakeManager || ''}
        placeholder={dashboardInfo ? dashboardInfo.formatMinStakeAmount : ''}
        open={minDepositModalOpen}
        close={() => {
          setMinDepositModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateLrtLsdManagerModal
        contractAddress={dashboardInfo?._stakeManager || ''}
        placeholder={dashboardInfo ? dashboardInfo._lsdManager : ''}
        open={updateLsdManagerModalOpen}
        close={() => {
          setUpdateLsdManagerModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateLrtOperatorModal
        contractAddress={dashboardInfo?._stakeManager || ''}
        placeholder={dashboardInfo ? dashboardInfo._operator : ''}
        poolAddr={dashboardInfo ? dashboardInfo._poolAddr : ''}
        open={updateOperatorModalOpen}
        close={() => {
          setUpdateOperatorModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateLstForStakeModal
        contractAddress={dashboardInfo?._stakeManager || ''}
        placeholder={dashboardInfo ? dashboardInfo._lstForStakeEth : ''}
        open={updateLstForStakeModalOpen}
        close={() => {
          setUpdateLstForStakeModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateSupportedLstsModal
        contractAddress={dashboardInfo?._stakeManager || ''}
        placeholder={dashboardInfo ? dashboardInfo._lstForStakeEth : ''}
        open={updateSupportedLstsModalOpen}
        supportedLsts={dashboardInfo ? dashboardInfo._supportedLsts : []}
        close={() => {
          setUpdateSupportedLstsModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />
    </div>
  );
};

import { Popover } from '@mui/material';
import classNames from 'classnames';
import {
  getFactoryContract,
  getLsdTokenContractAbi,
} from 'config/eth/contract';
import { getEvmFactoryAbi, getEvmStakeManagerAbi } from 'config/evm';
import { getEvmScanAccountUrl, getEvmScanValidatorUrl } from 'config/explorer';
import { robotoBold, robotoSemiBold } from 'config/font';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { EvmLsdTokenConfig } from 'interfaces/common';
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
import snackbarUtil from 'utils/snackbarUtils';
import { formatDuration } from 'utils/timeUtils';
import { getWeb3 } from 'utils/web3Utils';
import { formatEther } from 'viem';
import { useConnect, useSwitchNetwork } from 'wagmi';
import { DataLoading } from './common/DataLoading';
import { EmptyContent } from './common/EmptyContent';
import { Icomoon } from './icon/Icomoon';
import { AddEvmValidatorModal } from './modal/evm/AddEvmValidatorModal';
import { RemoveEvmValidatorModal } from './modal/evm/RemoveEvmValidatorModal';
import { UpdateEvmFactoryFeeModal } from './modal/evm/UpdateEvmFactoryFeeModal';
import { UpdateEvmMinDepositModal } from './modal/evm/UpdateEvmMinDepositModal';
import { UpdateEvmPlatformFeeModal } from './modal/evm/UpdateEvmPlatformFeeModal';
import { getInjectedConnector } from 'utils/commonUtils';

interface Props {
  lsdTokenConfig: EvmLsdTokenConfig;
}

export const EvmDashboard = (props: Props) => {
  const { lsdTokenConfig } = props;
  const { metaMaskAccount } = useWalletAccount();
  const [lsdTokens, setLsdTokens] = useState<string[]>([]);

  const updateList = useCallback(async () => {
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
      setLsdTokens(lsdTokensOfCreater);
    } catch (err: any) {
      console.log({ err });
    }
  }, [metaMaskAccount, lsdTokenConfig]);

  useEffect(() => {
    updateList();
  }, [updateList]);

  return (
    <div>
      {lsdTokens.length > 0 ? (
        lsdTokens.map((address) => (
          <DashboardItem
            lsdTokenConfig={lsdTokenConfig}
            key={address}
            address={address}
          />
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
  _stakeManager: string;
  _stakePool: string;
  _voters: string[];
  _admin: string;
  isEntrusted: boolean;
  formatPlatformFeeCommission: string;
  formatFactoryFeeCommission: string;
  eraSeconds: string;
  unbondingDuration: string;
  formatMinStakeAmount: string;
  latestEra: string;
}

const DashboardItem = (props: {
  lsdTokenConfig: EvmLsdTokenConfig;
  address: string;
}) => {
  const { address, lsdTokenConfig } = props;
  const { metaMaskAccount } = useWalletAccount();
  const settingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'setting',
  });
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>();
  const [platformFeeModalOpen, setPlatformFeeModalOpen] = useState(false);
  const [stackFeeModalOpen, setStackFeeModalOpen] = useState(false);
  const [minDepositModalOpen, setMinDepositModalOpen] = useState(false);
  const [addValidatorModalOpen, setAddValidatorModalOpen] = useState(false);
  const [removeValidatorModalOpen, setRemoveValidatorModalOpen] =
    useState(false);

  const updateData = useCallback(async () => {
    try {
      const web3 = getWeb3(lsdTokenConfig.rpc);
      const factoryContract = new web3.eth.Contract(
        getEvmFactoryAbi(lsdTokenConfig.symbol),
        lsdTokenConfig.factoryContract
      );

      const networkContractsOfLsdToken = await factoryContract.methods
        .networkContractsOfLsdToken(address)
        .call();
      // console.log({ networkContractsOfLsdToken });

      const entrustedLsdTokens: string[] = await factoryContract.methods
        .getEntrustedLsdTokens()
        .call();

      const isEntrusted = entrustedLsdTokens.includes(address);

      if (!networkContractsOfLsdToken) {
        return;
      }

      const stakeManagerContract = new web3.eth.Contract(
        getEvmStakeManagerAbi(lsdTokenConfig.symbol),
        networkContractsOfLsdToken._stakeManager
      );

      const _voters = await stakeManagerContract.methods
        .getValidatorsOf(networkContractsOfLsdToken._stakePool)
        .call();

      const adminAddress = await stakeManagerContract.methods.owner().call();

      const lsdTokenContract = new web3.eth.Contract(
        getLsdTokenContractAbi(),
        address
      );
      const tokenSymbol = await lsdTokenContract.methods.symbol().call();

      const protocolFeeCommission = await stakeManagerContract.methods
        .protocolFeeCommission()
        .call();
      const factoryFeeCommission = await stakeManagerContract.methods
        .factoryFeeCommission()
        .call();
      const eraSeconds = await stakeManagerContract.methods.eraSeconds().call();
      const unbondingDuration = await stakeManagerContract.methods
        .unbondingDuration()
        .call();
      const minStakeAmount = await stakeManagerContract.methods
        .minStakeAmount()
        .call();
      const latestEra = await stakeManagerContract.methods.latestEra().call();

      setDashboardInfo({
        symbol: tokenSymbol,
        _admin: adminAddress,
        _voters: [..._voters],
        _stakeManager: networkContractsOfLsdToken._stakeManager,
        _stakePool: networkContractsOfLsdToken._stakePool,
        isEntrusted,
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
        formatFactoryFeeCommission: formatNumber(
          Number(
            formatEther(BigInt(factoryFeeCommission) * BigInt(100))
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
  }, [address, lsdTokenConfig]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  const { connectors, connectAsync } = useConnect();
  const { switchNetworkAsync } = useSwitchNetwork();

  const connectWallet = async () => {
    if (metaMaskAccount && switchNetworkAsync) {
      await switchNetworkAsync(lsdTokenConfig.chainId);
      return;
    }
    const metamaskConnector = getInjectedConnector(connectors);
    if (!metamaskConnector) {
      return;
    }
    try {
      await connectAsync({
        chainId: lsdTokenConfig.chainId,
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
            <Image src={lsdTokenConfig.icon} layout="fill" alt="icon" />
          </div>

          {dashboardInfo ? (
            <Link
              href={getEvmScanAccountUrl(lsdTokenConfig.symbol, address)}
              target="_blank"
            >
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
          {...(dashboardInfo ? bindTrigger(settingsPopupState) : {})}
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
            <div className="text-text2">Platform Fee Commission:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatPlatformFeeCommission : '--'}
              %
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Stack Fee Commission:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatFactoryFeeCommission : '--'}%
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Min Deposit Amount:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatMinStakeAmount : '--'}{' '}
              {lsdTokenConfig.symbol}
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

        <div className="mt-[-.4rem] self-stretch w-[1px] bg-[#6C86AD33]" />

        <div
          className="grid gap-y-[.24rem] pl-[.38rem]"
          style={{
            gridTemplateColumns: '40% 40% 20%',
          }}
        >
          <div>
            <div className="flex items-center">
              <Link
                href={getEvmScanAccountUrl(lsdTokenConfig.symbol, address)}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">LSD Token Address</div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getEvmScanAccountUrl(
                  lsdTokenConfig.symbol,
                  getFactoryContract().address
                )}
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
                href={getEvmScanAccountUrl(
                  lsdTokenConfig.symbol,
                  dashboardInfo?._admin || ''
                )}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">Owner Address</div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <Link
                href={getEvmScanAccountUrl(
                  lsdTokenConfig.symbol,
                  dashboardInfo?._stakePool || ''
                )}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    Stake Pool Address
                  </div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getEvmScanAccountUrl(
                  lsdTokenConfig.symbol,
                  dashboardInfo?._stakeManager || ''
                )}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    Stake Manager Address
                  </div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>
          </div>

          <div className="max-h-[1.62rem] overflow-auto">
            <div className="text-text2">Validators:</div>

            {dashboardInfo?._voters?.map((voter, index) => (
              <div key={index} className="flex items-center mt-[.24rem]">
                <Link
                  href={getEvmScanValidatorUrl(lsdTokenConfig.symbol, voter)}
                  target="_blank"
                >
                  <div className="flex item-center cursor-pointer">
                    <div className="text-link mr-[.06rem]">
                      Validator-{index + 1}
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
              if (dashboardInfo?._admin !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              setPlatformFeeModalOpen(true);
              settingsPopupState.close();
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Platform Fee
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._admin !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              setStackFeeModalOpen(true);
              settingsPopupState.close();
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
              if (dashboardInfo?._admin !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
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
              if (dashboardInfo?._admin !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setAddValidatorModalOpen(true);
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Add Validator
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._admin !== metaMaskAccount) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              if ((dashboardInfo?._voters?.length || 0) <= 1) {
                snackbarUtil.error('Validators must be more than 1.');
                return;
              }
              settingsPopupState.close();
              setRemoveValidatorModalOpen(true);
            }}
          >
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Remove Validator
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>
        </div>
      </Popover>

      <UpdateEvmPlatformFeeModal
        lsdTokenConfig={lsdTokenConfig}
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

      <UpdateEvmFactoryFeeModal
        lsdTokenConfig={lsdTokenConfig}
        contractAddress={dashboardInfo?._stakeManager || ''}
        placeholder={
          dashboardInfo ? dashboardInfo.formatFactoryFeeCommission : ''
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

      <UpdateEvmMinDepositModal
        contractAddress={dashboardInfo?._stakeManager || ''}
        lsdTokenConfig={lsdTokenConfig}
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

      <AddEvmValidatorModal
        poolAddress={dashboardInfo?._stakePool || ''}
        contractAddress={dashboardInfo?._stakeManager || ''}
        lsdTokenConfig={lsdTokenConfig}
        currentValidators={dashboardInfo?._voters || []}
        placeholder={
          lsdTokenConfig.symbol === 'SEI'
            ? 'Example: seivaloper...'
            : 'Example: 0x...'
        }
        open={addValidatorModalOpen}
        close={() => {
          setAddValidatorModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <RemoveEvmValidatorModal
        poolAddress={dashboardInfo?._stakePool || ''}
        contractAddress={dashboardInfo?._stakeManager || ''}
        lsdTokenConfig={lsdTokenConfig}
        validators={dashboardInfo?._voters || []}
        open={removeValidatorModalOpen}
        close={() => {
          setRemoveValidatorModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />
    </div>
  );
};

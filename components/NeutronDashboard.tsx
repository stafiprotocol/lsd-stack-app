import { Popover } from '@mui/material';
import classNames from 'classnames';
import { lsdTokenConfigs, neutronChainConfig } from 'config/cosmos/chain';
import {
  getCosmosExplorerAccountUrl,
  getNeutronExplorerAccountUrl,
  getNeutronExplorerContractUrl,
} from 'config/explorer';
import { robotoBold, robotoSemiBold } from 'config/font';
import { LsdToken } from 'gen/neutron';
import { useAppDispatch } from 'hooks/common';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
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
import { connectKeplrAccount } from 'redux/reducers/WalletSlice';
import { getNeutronWasmClient, getStakeManagerClient } from 'utils/cosmosUtils';
import { chainAmountToHuman, formatNumber } from 'utils/numberUtils';
import snackbarUtil from 'utils/snackbarUtils';
import { formatDuration } from 'utils/timeUtils';
import { DataLoading } from './common/DataLoading';
import { EmptyContent } from './common/EmptyContent';
import { Icomoon } from './icon/Icomoon';
import { UpdateCosmosEraSecondsModal } from './modal/cosmos/UpdateCosmosEraSecondsModal';
import { UpdateCosmosFeeReceiverModal } from './modal/cosmos/UpdateCosmosFeeReceiverModal';
import { UpdateCosmosLsmSupportModal } from './modal/cosmos/UpdateCosmosLsmSupportModal';
import { UpdateCosmosMinDepositModal } from './modal/cosmos/UpdateCosmosMinDepositModal';
import { UpdateCosmosPlatformFeeModal } from './modal/cosmos/UpdateCosmosPlatformFeeModal';
import { UpdateCosmosUnbondFeeModal } from './modal/cosmos/UpdateCosmosUnbondFeeModal';
import { getNeutronStakeManagerContract } from 'config/cosmos/contract';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { PrimaryLoading } from './common/PrimaryLoading';

export const NeutronDashboard = () => {
  const neutronAccount = useCosmosChainAccount(neutronChainConfig.chainId);

  const listQuery: UseQueryResult<string[] | undefined> = useQuery({
    queryKey: ['GetNeutronDashboardList', neutronAccount?.bech32Address],
    enabled: !!neutronAccount?.bech32Address,
    queryFn: async () => {
      try {
        const stakeManagerClient = await getStakeManagerClient();
        const interchainAccountIds =
          await stakeManagerClient.queryInterchainAccountIdFromCreator({
            addr: neutronAccount?.bech32Address || '',
          });

        return interchainAccountIds;
      } catch (err: any) {
        console.log({ err });
      }
    },
  });

  return (
    <div>
      {!listQuery.isLoading &&
        (!!listQuery.data?.length ? (
          listQuery.data.map((ica) => <DashboardItem key={ica} ica={ica} />)
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
  status: string;
  validatorUpdateStatus: string;
  _admin: string;
  _interchainAccount: string;
  _lsdToken: string;
  _poolAddress: string;
  _platformFeeReceiver: string;
  formatUnbondCommission: string;
  formatPlatformFeeCommission: string;
  formatMinimalStake: string;
  eraSeconds: number;
  unstakeTimesLimit: number;
  unbondingPeriod: number;
  formatTotalLsdTokenAmount: string;
  lsmSupport: boolean;
  remoteDenom: string;
}

const DashboardItem = (props: { ica: string }) => {
  const dispatch = useAppDispatch();
  const { ica } = props;
  const neutronAccount = useCosmosChainAccount(neutronChainConfig.chainId);
  const settingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'setting',
  });
  const linksPopupState = usePopupState({
    variant: 'popover',
    popupId: 'links',
  });
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>();
  const [updatePlatformFeeModalOpen, setUpdatePlatformFeeModalOpen] =
    useState(false);
  const [
    updatePlatformFeeReceiverModalOpen,
    setUpdatePlatformFeeReceiverModalOpen,
  ] = useState(false);
  const [updateUnbondFeeModalOpen, setUpdateUnbondFeeModalOpen] =
    useState(false);
  const [minDepositModalOpen, setMinDepositModalOpen] = useState(false);
  const [eraSecondsModalOpen, setEraSecondsModalOpen] = useState(false);
  const [lsmSupportModalOpen, setLsmSupportModalOpen] = useState(false);

  const lsdTokenConfig =
    lsdTokenConfigs.find(
      (item) => item.displayName === dashboardInfo?.remoteDenom
    ) || lsdTokenConfigs[0];

  const updateData = useCallback(async () => {
    try {
      const stakeManagerClient = await getStakeManagerClient();
      const output =
        await stakeManagerClient.queryInterchainAccountAddressFromContract({
          interchain_account_id: ica,
        });
      // console.log({ output });
      const _admin = output.admin;
      const pool_addr = output.pool_address_ica_info.ica_addr;

      const poolInfo = await stakeManagerClient.queryPoolInfo({ pool_addr });
      const _lsdToken = poolInfo.lsd_token;
      const _platformFeeReceiver = poolInfo.platform_fee_receiver;

      const wasmClient = await getNeutronWasmClient();
      const lsdTokenClient = new LsdToken.Client(
        wasmClient,
        poolInfo.lsd_token
      );
      const tokenInfo = await lsdTokenClient.queryTokenInfo();

      setDashboardInfo({
        symbol: tokenInfo.symbol,
        validatorUpdateStatus: poolInfo.validator_update_status,
        _admin,
        _interchainAccount: '',
        _lsdToken,
        _poolAddress: pool_addr,
        _platformFeeReceiver,
        formatUnbondCommission: formatNumber(
          chainAmountToHuman(Number(poolInfo.unbond_commission) * 100, 6),
          { decimals: 2, fixedDecimals: false, roundMode: 'round' }
        ),
        formatPlatformFeeCommission: formatNumber(
          chainAmountToHuman(Number(poolInfo.platform_fee_commission) * 100, 6),
          { decimals: 2, fixedDecimals: false, roundMode: 'round' }
        ),
        formatMinimalStake: formatNumber(
          chainAmountToHuman(poolInfo.minimal_stake, 6),
          { decimals: 6, fixedDecimals: false }
        ),
        eraSeconds: poolInfo.era_seconds,
        unstakeTimesLimit: poolInfo.unstake_times_limit,
        unbondingPeriod: poolInfo.unbonding_period,
        status: poolInfo.status,
        formatTotalLsdTokenAmount: formatNumber(
          chainAmountToHuman(poolInfo.total_lsd_token_amount, 6),
          { decimals: 6, fixedDecimals: false }
        ),
        lsmSupport: poolInfo.lsm_support,
        remoteDenom: poolInfo.remote_denom,
      });
    } catch (err: any) {
      console.log({ err });
    }
  }, [ica]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  const connectWallet = async () => {
    dispatch(connectKeplrAccount([neutronChainConfig]));
  };

  if (!dashboardInfo) {
    return null;
  }

  return (
    <div className="mt-[.24rem] bg-bg2 rounded-[.12rem] border border-[#ffffff] px-[.24rem] pt-[.32rem] pb-[.4rem]">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-[.34rem] h-[.34rem] relative mr-[.12rem]">
            <Image src={lsdTokenConfig.icon} layout="fill" alt="icon" />
          </div>

          {dashboardInfo ? (
            <Link
              href={getNeutronExplorerAccountUrl(
                dashboardInfo?._lsdToken || ''
              )}
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
          <div className=" items-center hidden">
            <div className="text-text2">Status:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.status : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">LSM Support:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? (dashboardInfo.lsmSupport ? 'Y' : 'N') : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Platform Fee Commission:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatPlatformFeeCommission : '--'}
              %
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Minimal Stake Amount:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatMinimalStake : '--'} ATOM
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Total LSD Amount:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatTotalLsdTokenAmount : '--'}{' '}
              {dashboardInfo?.symbol || ''}
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
                    dashboardInfo.eraSeconds *
                      dashboardInfo.unbondingPeriod *
                      1000
                  )
                : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Unstake Times Limit:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.unstakeTimesLimit : '--'}
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
              if (dashboardInfo?._admin !== neutronAccount?.bech32Address) {
                snackbarUtil.error(
                  'Only the pool admin can change parameters.'
                );
                return;
              }
              if (dashboardInfo?.status !== 'active_ended') {
                snackbarUtil.error(
                  'The pool could not be updated until new era completed.'
                );
                return;
              }
              if (dashboardInfo?.validatorUpdateStatus !== 'end') {
                snackbarUtil.error(
                  'The pool could not be updated until validator update finished.'
                );
                return;
              }
              setUpdatePlatformFeeModalOpen(true);
              settingsPopupState.close();
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
              if (dashboardInfo?._admin !== neutronAccount?.bech32Address) {
                snackbarUtil.error(
                  'Only the pool admin can change parameters.'
                );
                return;
              }
              if (dashboardInfo?.status !== 'active_ended') {
                snackbarUtil.error(
                  'The pool could not be updated until new era completed.'
                );
                return;
              }
              if (dashboardInfo?.validatorUpdateStatus !== 'end') {
                snackbarUtil.error(
                  'The pool could not be updated until validator update finished.'
                );
                return;
              }
              setUpdatePlatformFeeReceiverModalOpen(true);
              settingsPopupState.close();
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Platform Fee Receiver
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer items-center justify-between hidden"
            onClick={() => {
              if (dashboardInfo?._admin !== neutronAccount?.bech32Address) {
                snackbarUtil.error(
                  'Only the pool admin can change parameters.'
                );
                return;
              }
              if (dashboardInfo?.status !== 'active_ended') {
                snackbarUtil.error(
                  'The pool could not be updated until new era completed.'
                );
                return;
              }
              if (dashboardInfo?.validatorUpdateStatus !== 'end') {
                snackbarUtil.error(
                  'The pool could not be updated until validator update finished.'
                );
                return;
              }
              setUpdateUnbondFeeModalOpen(true);
              settingsPopupState.close();
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Unbond Commission Fee
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer hidden items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._admin !== neutronAccount?.bech32Address) {
                snackbarUtil.error(
                  'Only the pool admin can change parameters.'
                );
                return;
              }
              if (dashboardInfo?.status !== 'active_ended') {
                snackbarUtil.error(
                  'The pool could not be updated until new era completed.'
                );
                return;
              }
              if (dashboardInfo?.validatorUpdateStatus !== 'end') {
                snackbarUtil.error(
                  'The pool could not be updated until validator update finished.'
                );
                return;
              }
              settingsPopupState.close();
              setEraSecondsModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">Era Seconds</div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?._admin !== neutronAccount?.bech32Address) {
                snackbarUtil.error(
                  'Only the pool admin can change parameters.'
                );
                return;
              }
              if (dashboardInfo?.status !== 'active_ended') {
                snackbarUtil.error(
                  'The pool could not be updated until new era completed.'
                );
                return;
              }
              if (dashboardInfo?.validatorUpdateStatus !== 'end') {
                snackbarUtil.error(
                  'The pool could not be updated until validator update finished.'
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
              if (dashboardInfo?._admin !== neutronAccount?.bech32Address) {
                snackbarUtil.error(
                  'Only the pool admin can change parameters.'
                );
                return;
              }
              if (dashboardInfo?.status !== 'active_ended') {
                snackbarUtil.error(
                  'The pool could not be updated until new era completed.'
                );
                return;
              }
              if (dashboardInfo?.validatorUpdateStatus !== 'end') {
                snackbarUtil.error(
                  'The pool could not be updated until validator update finished.'
                );
                return;
              }
              settingsPopupState.close();
              setLsmSupportModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">LSM Support</div>

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
          <Link
            href={getNeutronExplorerContractUrl(dashboardInfo?._lsdToken || '')}
            target="_blank"
          >
            <div className="flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">LSD Token Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getNeutronExplorerAccountUrl(dashboardInfo?._admin || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between items-center flex cursor-pointer">
              <div className="text-link mr-[.06rem]">Owner Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getNeutronExplorerAccountUrl(
              dashboardInfo?._platformFeeReceiver || ''
            )}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between items-center flex cursor-pointer">
              <div className="text-link mr-[.06rem]">Fee Receiver Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getCosmosExplorerAccountUrl(
              dashboardInfo?._poolAddress || ''
            )}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between items-center flex cursor-pointer">
              <div className="text-link mr-[.06rem]">Pool Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getNeutronExplorerContractUrl(
              getNeutronStakeManagerContract()
            )}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between items-center flex cursor-pointer">
              <div className="text-link mr-[.06rem]">Stake Manager Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>
        </div>
      </Popover>

      <UpdateCosmosEraSecondsModal
        pool_addr={dashboardInfo?._poolAddress || ''}
        placeholder={dashboardInfo ? dashboardInfo.eraSeconds + '' : ''}
        open={eraSecondsModalOpen}
        close={() => {
          setEraSecondsModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateCosmosMinDepositModal
        pool_addr={dashboardInfo?._poolAddress || ''}
        placeholder={dashboardInfo ? dashboardInfo.formatMinimalStake + '' : ''}
        open={minDepositModalOpen}
        close={() => {
          setMinDepositModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateCosmosPlatformFeeModal
        pool_addr={dashboardInfo?._poolAddress || ''}
        placeholder={
          dashboardInfo ? dashboardInfo.formatPlatformFeeCommission + '' : ''
        }
        open={updatePlatformFeeModalOpen}
        close={() => {
          setUpdatePlatformFeeModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateCosmosUnbondFeeModal
        pool_addr={dashboardInfo?._poolAddress || ''}
        placeholder={
          dashboardInfo ? dashboardInfo.formatUnbondCommission + '' : ''
        }
        open={updateUnbondFeeModalOpen}
        close={() => {
          setUpdateUnbondFeeModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateCosmosFeeReceiverModal
        pool_addr={dashboardInfo?._poolAddress || ''}
        placeholder={
          dashboardInfo ? dashboardInfo._platformFeeReceiver + '' : ''
        }
        open={updatePlatformFeeReceiverModalOpen}
        close={() => {
          setUpdatePlatformFeeReceiverModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />

      <UpdateCosmosLsmSupportModal
        pool_addr={dashboardInfo?._poolAddress || ''}
        defaultEnabled={dashboardInfo ? dashboardInfo.lsmSupport : false}
        open={lsmSupportModalOpen}
        close={() => {
          setLsmSupportModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
      />
    </div>
  );
};

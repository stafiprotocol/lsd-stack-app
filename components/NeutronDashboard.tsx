import { Popover } from '@mui/material';
import classNames from 'classnames';
import { neutronChainConfig } from 'config/cosmos/chain';
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

export const NeutronDashboard = () => {
  const { metaMaskAccount } = useWalletAccount();
  const neutronAccount = useCosmosChainAccount(neutronChainConfig.chainId);
  const [icas, setIcas] = useState<string[]>([]);

  const updateList = useCallback(async () => {
    try {
      const stakeManagerClient = await getStakeManagerClient();
      const interchainAccountIds =
        await stakeManagerClient.queryInterchainAccountIdFromCreator({
          addr: neutronAccount?.bech32Address || '',
        });

      // console.log({ interchainAccountIds });
      setIcas(interchainAccountIds);
    } catch (err: any) {
      console.log({ err });
    }
  }, [neutronAccount?.bech32Address]);

  useEffect(() => {
    updateList();
  }, [updateList]);

  return (
    <div>
      <div className={classNames('text-[.24rem]', robotoSemiBold.className)}>
        My Deployment History
      </div>

      {icas.length > 0 ? (
        icas.map((ica) => <DashboardItem key={ica} ica={ica} />)
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
}

const DashboardItem = (props: { ica: string }) => {
  const dispatch = useAppDispatch();
  const { ica } = props;
  const neutronAccount = useCosmosChainAccount(neutronChainConfig.chainId);
  const settingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'setting',
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

  return (
    <div className="mt-[.24rem] bg-bg2 rounded-[.12rem] border border-[#ffffff] p-[.24rem]">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-[.34rem] h-[.34rem] relative mr-[.12rem]">
            <Image src={eth} layout="fill" alt="icon" />
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
          gridTemplateColumns: '55% 1px 45%',
        }}
      >
        <div
          className="grid gap-y-[.24rem]"
          style={{
            gridTemplateColumns: '50% 50%',
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
                href={getNeutronExplorerContractUrl(
                  dashboardInfo?._lsdToken || ''
                )}
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
                href={getNeutronExplorerAccountUrl(dashboardInfo?._admin || '')}
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
                href={getNeutronExplorerAccountUrl(
                  dashboardInfo?._platformFeeReceiver || ''
                )}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    Fee Receiver Address
                  </div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <Link
                href={getCosmosExplorerAccountUrl(
                  dashboardInfo?._poolAddress || ''
                )}
                target="_blank"
              >
                <div className="flex item-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">Pool Address</div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>

            <div className="mt-[.24rem] flex items-center">
              <Link
                href={getNeutronExplorerContractUrl(
                  getNeutronStakeManagerContract()
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
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Platform Fee Receiver
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer items-center justify-between hidden"
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
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Unbond Commission Fee
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer hidden items-center justify-between"
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
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              Era Seconds
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="py-[.1rem] cursor-pointer flex items-center justify-between"
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
            <div className="ml-[.12rem] text-color-text2 text-[.14rem]">
              LSM Support
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>
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

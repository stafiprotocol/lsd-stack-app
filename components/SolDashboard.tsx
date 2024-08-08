import { AnchorProvider, BN, Program, setProvider } from '@coral-xyz/anchor';
import { Popover } from '@mui/material';
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';
import { getSolanaScanAccountUrl } from 'config/explorer';
import { robotoBold, robotoSemiBold } from 'config/font';
import { solanaPrograms } from 'config/sol';
import { IDL, LsdProgram } from 'config/sol/idl/lsd_program';
import { useDebouncedEffect } from 'hooks/useDebouncedEffect';
import { useUserAddress } from 'hooks/useUserAddress';
import { AppEco } from 'interfaces/common';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import Link from 'next/link';
import cup from 'public/images/cup.svg';
import edit from 'public/images/edit.svg';
import sol from 'public/images/tokens/SOL.svg';
import { useCallback, useState } from 'react';
import { chainAmountToHuman, formatNumber } from 'utils/numberUtils';
import snackbarUtil from 'utils/snackbarUtils';
import { DataLoading } from './common/DataLoading';
import { EmptyContent } from './common/EmptyContent';
import { Icomoon } from './icon/Icomoon';
import { UpdateSolPlatformFeeModal } from './modal/sol/UpdateSolPlatformFeeModal';
import { UpdateSolMinDepositModal } from './modal/sol/UpdateSolMinDepositModal';
import { AddSolValidatorModal } from './modal/sol/AddSolValidatorModal';
import { RemoveSolValidatorModal } from './modal/sol/RemoveSolValidatorModal';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { PrimaryLoading } from './common/PrimaryLoading';
import { UpdateSolRateChangeLimitModal } from './modal/sol/UpdateSolRateChangeLimitModal';

export const SolDashboard = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const listQuery: UseQueryResult<string[] | undefined> = useQuery({
    queryKey: ['GetSolDashboardList', publicKey?.toString()],
    enabled: !!publicKey?.toString(),
    queryFn: async () => {
      if (!publicKey) {
        return;
      }
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

      return stakeManagerAddresses;
    },
  });

  return (
    <div className="relative">
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
  admin: PublicKey;
  balancer: PublicKey;
  lsdTokenMint: PublicKey;
  stack: PublicKey;
  validators: PublicKey[];
  formatPlatformFeeCommission: string;
  formatStackCommissionRate: string;
  unbondingDuration: string;
  formatMinStakeAmount: string;
  formatRateChangeLimit: string;
  latestEra: string;
}

const DashboardItem = (props: { address: string }) => {
  const { address } = props;
  const userAddress = useUserAddress(AppEco.Sol);
  const wallet = useAnchorWallet();
  const walletModal = useWalletModal();
  const { connection } = useConnection();

  const settingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'setting',
  });
  const linksPopupState = usePopupState({
    variant: 'popover',
    popupId: 'links',
  });
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>();
  const [platformFeeModalOpen, setPlatformFeeModalOpen] = useState(false);
  const [rateChangeLimitModalOpen, setRateChangeLimitModalOpen] =
    useState(false);
  const [minDepositModalOpen, setMinDepositModalOpen] = useState(false);
  const [addValidatorModalOpen, setAddValidatorModalOpen] = useState(false);
  const [removeValidatorModalOpen, setRemoveValidatorModalOpen] =
    useState(false);

  const updateData = useCallback(async () => {
    try {
      if (!wallet) {
        return;
      }
      const { PublicKey } = await import('@solana/web3.js');
      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const programId = new PublicKey(solanaPrograms.lsdProgramId);
      const program = new Program<LsdProgram>(IDL, programId);

      const stakeManagerAccount = await program.account.stakeManager.fetch(
        new PublicKey(address)
      );
      // console.log({ stakeManagerAccount });

      setDashboardInfo({
        symbol: 'SOL LST',
        admin: stakeManagerAccount.admin,
        balancer: stakeManagerAccount.balancer,
        stack: stakeManagerAccount.stack,
        lsdTokenMint: stakeManagerAccount.lsdTokenMint,
        validators: stakeManagerAccount.validators,
        formatPlatformFeeCommission: formatNumber(
          Number(
            chainAmountToHuman(
              stakeManagerAccount.platformFeeCommission
                .mul(new BN(100))
                .toString(),
              9
            )
          ).toString(),
          {
            decimals: 2,
            fixedDecimals: false,
            roundMode: 'round',
          }
        ),
        formatStackCommissionRate: formatNumber(
          Number(
            chainAmountToHuman(
              stakeManagerAccount.stackFeeCommission
                .mul(new BN(100))
                .toString(),
              9
            )
          ).toString(),
          {
            decimals: 2,
            fixedDecimals: false,
            roundMode: 'round',
          }
        ),
        formatMinStakeAmount: formatNumber(
          chainAmountToHuman(stakeManagerAccount.minStakeAmount.toString(), 9),
          {
            decimals: 6,
            fixedDecimals: false,
          }
        ),
        formatRateChangeLimit: formatNumber(
          Number(
            chainAmountToHuman(
              stakeManagerAccount.rateChangeLimit.mul(new BN(100)).toString(),
              9
            )
          ).toString(),
          {
            decimals: 2,
            fixedDecimals: false,
            roundMode: 'round',
          }
        ),
        unbondingDuration: stakeManagerAccount.unbondingDuration.toString(),
        latestEra: stakeManagerAccount.latestEra.toString(),
      });
    } catch (err: any) {
      console.log({ err });
    }
  }, [address, connection, wallet]);

  useDebouncedEffect(
    () => {
      updateData();
    },
    [updateData],
    1000
  );

  const connectWallet = async () => {
    walletModal.setVisible(true);
  };

  return (
    <div className="mt-[.24rem] bg-bg2 rounded-[.12rem] border border-[#ffffff] px-[.24rem] pt-[.32rem] pb-[.4rem]">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-[.34rem] h-[.34rem] relative mr-[.12rem]">
            <Image src={sol} layout="fill" alt="icon" />
          </div>

          {dashboardInfo ? (
            <Link href={getSolanaScanAccountUrl(address)} target="_blank">
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
              {dashboardInfo ? dashboardInfo.formatStackCommissionRate : '--'}%
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Min Deposit Amount:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.formatMinStakeAmount : '--'} SOL
            </div>
          </div>

          {/* <div className="flex items-center">
            <div className="text-text2">Era Seconds:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.eraSeconds : '--'}
            </div>
          </div> */}

          <div className="flex items-center">
            <div className="text-text2">Unbonding Duration:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo
                ? `${Number(dashboardInfo.unbondingDuration)} Epochs`
                : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Latest Era:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo ? dashboardInfo.latestEra : '--'}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Rate Change Limit:</div>
            <div className="text-text1 ml-[.06rem] ">
              {dashboardInfo
                ? `${Number(dashboardInfo.formatRateChangeLimit)}%`
                : '--'}
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
              if (dashboardInfo?.admin?.toString() !== userAddress) {
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
              if (dashboardInfo?.admin?.toString() !== userAddress) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setRateChangeLimitModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Rate Change Limit
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?.admin?.toString() !== userAddress) {
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
              if (dashboardInfo?.admin?.toString() !== userAddress) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              settingsPopupState.close();
              setAddValidatorModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">Add Validator</div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              if (dashboardInfo?.admin?.toString() !== userAddress) {
                snackbarUtil.error(
                  'Please use the owner address to update parameters.'
                );
                return;
              }
              if ((dashboardInfo?.validators?.length || 0) <= 1) {
                snackbarUtil.error('Validators must be more than 1.');
                return;
              }
              settingsPopupState.close();
              setRemoveValidatorModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Remove Validator
            </div>

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
            href={getSolanaScanAccountUrl(
              dashboardInfo?.lsdTokenMint?.toString()
            )}
            target="_blank"
          >
            <div className="flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">LST Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getSolanaScanAccountUrl(dashboardInfo?.admin?.toString())}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Owner Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getSolanaScanAccountUrl(dashboardInfo?.balancer?.toString())}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Balancer Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getSolanaScanAccountUrl(dashboardInfo?.stack?.toString())}
            target="_blank"
          >
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">
                Stack Contract Address
              </div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link href={getSolanaScanAccountUrl(address)} target="_blank">
            <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Stake Manager Address</div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          {dashboardInfo?.validators?.map((validator, index) => (
            <div key={index}>
              <Link
                href={getSolanaScanAccountUrl(validator.toString())}
                target="_blank"
              >
                <div className="mt-[.24rem] flex justify-between items-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">
                    Validator {index + 1}
                  </div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Popover>

      <UpdateSolPlatformFeeModal
        open={platformFeeModalOpen}
        close={() => {
          setPlatformFeeModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
        stakeManagerAddress={address}
        placeholder={dashboardInfo?.formatStackCommissionRate || ''}
      />

      <UpdateSolRateChangeLimitModal
        open={rateChangeLimitModalOpen}
        close={() => {
          setRateChangeLimitModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
        stakeManagerAddress={address}
        placeholder={dashboardInfo?.formatRateChangeLimit || ''}
      />

      <UpdateSolMinDepositModal
        open={minDepositModalOpen}
        close={() => {
          setMinDepositModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
        stakeManagerAddress={address}
        placeholder={dashboardInfo?.formatMinStakeAmount || ''}
      />

      <AddSolValidatorModal
        open={addValidatorModalOpen}
        close={() => {
          setAddValidatorModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
        stakeManagerAddress={address}
        currentValidators={dashboardInfo?.validators || []}
        placeholder="Example: HEL..."
      />

      <RemoveSolValidatorModal
        open={removeValidatorModalOpen}
        close={() => {
          setRemoveValidatorModalOpen(false);
        }}
        onConnectWallet={connectWallet}
        onRefresh={() => {
          updateData();
        }}
        stakeManagerAddress={address}
        currentValidators={dashboardInfo?.validators || []}
      />
    </div>
  );
};

import { Popover } from '@mui/material';
import classNames from 'classnames';
import { getEtherScanAccountUrl, getTonScanAccountUrl } from 'config/explorer';
import { robotoBold, robotoSemiBold } from 'config/font';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import Link from 'next/link';
import cup from 'public/images/cup.svg';
import edit from 'public/images/edit.svg';
import tonLogoImg from 'public/images/ton.svg';
import { useCallback, useEffect, useState } from 'react';
import { DataLoading } from './common/DataLoading';
import { Icomoon } from './icon/Icomoon';
import { EmptyContent } from './common/EmptyContent';
import { PrimaryLoading } from './common/PrimaryLoading';
import { useTonClient } from 'hooks/ton/useTonClient';
import { Stack } from 'config/ton/wrappers/stack';
import { Address, Dictionary } from '@ton/core';
import { stackContractAddress } from 'config/ton';
import { useTonAddress } from '@tonconnect/ui-react';
import { getStorage, STORAGE_TON_SEQNO } from 'utils/storageUtils';
import { StakePool, StakePoolConfig } from 'config/ton/wrappers/stakePool';
import { isDev } from 'config/common';
import {
  amountToChain,
  chainAmountToHuman,
  formatNumber,
  formatScientificNumber,
} from 'utils/numberUtils';
import {
  LsdTokenMaster,
  metadataDictionaryValue,
  toMetadataKey,
} from 'config/ton/wrappers/lsdTokenMaster';
import { UpdatePlatformFeeModal } from './modal/ton/UpdateNodePlatformFeeModal';
import { UpdateMinDepositModal } from './modal/ton/UpdateMinDepositModal';

export const TonDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sequences, setSequences] = useState<number[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const seqNoStr = getStorage(STORAGE_TON_SEQNO);
    const seqNo = seqNoStr === null ? 0 : Number(seqNoStr);
    const seqs: number[] = [];
    for (let i = 0; i <= seqNo; i++) {
      seqs.push(i);
    }
    setSequences(seqs);
    setIsLoading(false);
  }, []);

  return (
    <div>
      {!isLoading && sequences.length > 0 ? (
        sequences.map((seqNo) => <DashboardItem key={seqNo} sequence={seqNo} />)
      ) : (
        <div className="mt-[.56rem]">
          <EmptyContent />
        </div>
      )}

      {isLoading && (
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

const DashboardItem = (props: { sequence: number }) => {
  const { sequence } = props;

  const tonClient = useTonClient();
  const tonAddress = useTonAddress();

  const [stakePoolConfig, setStakePoolConfig] =
    useState<StakePoolConfig | null>(null);
  const [balance, setBalance] = useState<string>('');
  const [stakePoolAddress, setStakePoolAddress] = useState<string>('');
  const [lsdTokenAddress, setLsdTokenAddress] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');

  const [refresh, setRefresh] = useState(1);

  const [updatePlatformFeeModalOpen, setUpdatePlatformFeeModalOpen] =
    useState(false);
  const [updateMinDepositModalOpen, setUpdateMinDepositModalOpen] =
    useState(false);

  const settingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'setting',
  });
  const linksPopupState = usePopupState({
    variant: 'popover',
    popupId: 'links',
  });

  const updateData = useCallback(async () => {
    if (!tonClient) return;
    try {
      const stack = tonClient.open(
        new Stack(Address.parse(stackContractAddress))
      );
      const contractAddress = await stack.getContractAddresses(
        Address.parse(tonAddress),
        BigInt(sequence)
      );

      setStakePoolAddress(
        contractAddress.stakePool.toString({ testOnly: isDev() })
      );
      setLsdTokenAddress(
        contractAddress.lsdTokenMaster.toString({ testOnly: isDev() })
      );

      const stakePool = tonClient.open(
        new StakePool(contractAddress.stakePool)
      );
      const stakePoolState = await stakePool.getStakePoolState();
      const stakePoolBalance = await stakePool.getBalance();

      setStakePoolConfig(stakePoolState);
      setBalance(stakePoolBalance.toString());

      const lsdTokenMaster = tonClient.open(
        new LsdTokenMaster(contractAddress.lsdTokenMaster)
      );
      let jettonData = await lsdTokenMaster.getJettonData();

      const cell = jettonData[3];
      const slice = cell.beginParse();
      const prefix = slice.loadUint(8);
      if (prefix !== 0) {
        console.info('Expected a zero prefix for metadata but got %s', prefix);
        return;
      }
      const metadata = slice.loadDict(
        Dictionary.Keys.BigUint(256),
        metadataDictionaryValue
      );

      const labelsMap: Record<string, string | undefined> = {};
      labelsMap[toMetadataKey('decimals').toString()] = 'decimals';
      labelsMap[toMetadataKey('symbol').toString()] = 'symbol';
      labelsMap[toMetadataKey('name').toString()] = 'name';
      labelsMap[toMetadataKey('description').toString()] = 'description';
      labelsMap[toMetadataKey('image').toString()] = 'image';

      const tokenSymbol = metadata.get(toMetadataKey('symbol'));
      setTokenSymbol(tokenSymbol || '');
    } catch (err: any) {
      console.log({ err });
    }
  }, [tonClient, tonAddress]);

  useEffect(() => {
    updateData();
  }, [updateData, refresh]);

  if (!stakePoolConfig) {
    return null;
  }

  return (
    <div className="mt-[.24rem] bg-bg2 rounded-[.12rem] border border-[#ffffff] px-[.24rem] pt-[.32rem] pb-[.4rem]">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-[.34rem] h-[.34rem] relative mr-[.12rem]">
            <Image src={tonLogoImg} layout="fill" alt="icon" />
          </div>

          {tokenSymbol ? (
            <Link href={getTonScanAccountUrl(stakePoolAddress)} target="_blank">
              <div className="flex items-center cursor-pointer">
                <div
                  className={classNames(
                    'mr-[.12rem]  text-[.24rem]',
                    robotoSemiBold.className
                  )}
                >
                  {tokenSymbol}
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
            {...(stakePoolConfig ? bindTrigger(settingsPopupState) : {})}
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
            {...(stakePoolConfig ? bindTrigger(linksPopupState) : {})}
          >
            <Icomoon icon="more" size=".15rem" color="#6C86AD" />
          </div>
        </div>
      </div>

      <div
        className="mt-[.24rem] grid text-[.14rem] items-start"
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
              {stakePoolConfig
                ? formatRate(stakePoolConfig.platformCommissionRate)
                : '--'}
              %
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Stack Fee Commission:</div>
            <div className="text-text1 ml-[.06rem] ">
              {stakePoolConfig
                ? formatRate(stakePoolConfig.stackCommissionRate)
                : '--'}
              %
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Min Deposit Amount:</div>
            <div className="text-text1 ml-[.06rem] ">
              {stakePoolConfig
                ? formatScientificNumber(
                    chainAmountToHuman(
                      Number(stakePoolConfig.minStakeAmount),
                      9
                    )
                  )
                : '--'}{' '}
              TON
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Total Stakers TON:</div>
            <div className="text-text1 ml-[.06rem] ">
              {stakePoolConfig
                ? formatScientificNumber(
                    chainAmountToHuman(
                      stakePoolConfig.totalStakersTon.toString(),
                      9
                    )
                  )
                : '--'}{' '}
              TON
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Total LSD Token:</div>
            <div className="text-text1 ml-[.06rem] ">
              {stakePoolConfig
                ? stakePoolConfig.totalLsdToken.toString()
                : '--'}{' '}
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Total Unstaking TON:</div>
            <div className="text-text1 ml-[.06rem] ">
              {stakePoolConfig
                ? formatScientificNumber(
                    chainAmountToHuman(
                      stakePoolConfig.totalUnstakingTon.toString(),
                      9
                    )
                  )
                : '--'}{' '}
              TON
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Total Borrowers TON:</div>
            <div className="text-text1 ml-[.06rem] ">
              {stakePoolConfig
                ? formatScientificNumber(
                    chainAmountToHuman(
                      stakePoolConfig.totalBorrowersTon.toString(),
                      9
                    )
                  )
                : '--'}{' '}
              TON
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Total Borrowers Loan:</div>
            <div className="text-text1 ml-[.06rem] ">
              {stakePoolConfig
                ? formatScientificNumber(
                    chainAmountToHuman(
                      stakePoolConfig.totalBorrowersLoan.toString(),
                      9
                    )
                  )
                : '--'}{' '}
              TON
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Total Platform Fee:</div>
            <div className="text-text1 ml-[.06rem] ">
              {stakePoolConfig
                ? formatScientificNumber(
                    chainAmountToHuman(
                      stakePoolConfig.totalPlatformFee.toString(),
                      9
                    )
                  )
                : '--'}{' '}
              TON
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Platform Fee Reserved:</div>
            <div className="text-text1 ml-[.06rem] ">
              {stakePoolConfig
                ? formatScientificNumber(
                    chainAmountToHuman(
                      stakePoolConfig.platformFeeReserved.toString(),
                      9
                    )
                  )
                : '--'}{' '}
              TON
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-text2">Stake Pool Balance:</div>
            <div className="text-text1 ml-[.06rem] ">
              {balance ? chainAmountToHuman(balance, 9) : '--'} TON
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
              setUpdatePlatformFeeModalOpen(true);
              settingsPopupState.close();
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Platform Fee Commission
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setUpdateMinDepositModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Min Deposit Amount
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
          <Link href={getTonScanAccountUrl(stakePoolAddress)} target="_blank">
            <div className="flex items-center justify-between">
              <div className="text-link mr-[.06rem]">Stake Pool Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getTonScanAccountUrl(stackContractAddress)}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between flex items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">LSD Factory Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link href={getTonScanAccountUrl(lsdTokenAddress)} target="_blank">
            <div className="mt-[.24rem] justify-between flex items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">LSD Token Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link href={getTonScanAccountUrl(tonAddress)} target="_blank">
            <div className="mt-[.24rem] justify-between flex items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Owner Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>
        </div>
      </Popover>

      {updatePlatformFeeModalOpen && (
        <UpdatePlatformFeeModal
          open={updatePlatformFeeModalOpen}
          close={() => setUpdatePlatformFeeModalOpen(false)}
          contractAddress={stakePoolAddress}
          platformCommissionPlaceholder={formatRate(
            stakePoolConfig.platformCommissionRate
          )}
          onRefresh={() => {
            setRefresh((prev) => prev + 1);
          }}
        />
      )}

      {updateMinDepositModalOpen && (
        <UpdateMinDepositModal
          open={updateMinDepositModalOpen}
          close={() => setUpdateMinDepositModalOpen(false)}
          contractAddress={stakePoolAddress}
          placeholder={formatScientificNumber(
            chainAmountToHuman(Number(stakePoolConfig.minStakeAmount), 9)
          )}
          onRefresh={() => {
            setRefresh((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
};

const formatRate = (rate: bigint) => {
  return (Number(rate) / 100).toFixed(2);
};

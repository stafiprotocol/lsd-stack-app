import { Popover } from '@mui/material';
import classNames from 'classnames';
import { getEtherScanAccountUrl } from 'config/explorer';
import { robotoBold, robotoSemiBold } from 'config/font';
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
import { Icomoon } from '../icon/Icomoon';
import { formatDuration } from 'utils/timeUtils';
import { UpdateNodePlatformFeeModal } from './modal/UpdateNodePlatformFeeModal';
import { UpdateStackFeeModal } from './modal/UpdateStackFeeModal';
import { UpdateTrustEnabledModal } from './modal/UpdateTrustEnabledModal';
import { UpdateSoloEnabledModal } from './modal/UpdateSoloEnabledModal';
import { UpdateSoloDepositModal } from './modal/UpdateSoloDepositModal';
import { UpdateMinDepositModal } from './modal/UpdateMinDepositModal';
import { UpdateVotersModal } from './modal/UpdateVotersModal';
import { UpdateRewardPeriodModal } from './modal/updateRewardPeriodModal';
import { getFactoryContract } from 'config/eth/contract';

export const EthDashboard = () => {
  return (
    <div>
      <DashboardItem address={'0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b'} />

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
  const settingsPopupState = usePopupState({
    variant: 'popover',
    popupId: 'setting',
  });
  const linksPopupState = usePopupState({
    variant: 'popover',
    popupId: 'links',
  });
  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>({
    symbol: 'rETH',
    _admin: '0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b',
    _voters: [
      '0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b',
      '0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b',
      '0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b',
      '0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b',
      '0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b',
      '0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b',
      '0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b',
    ],
    _feePool: '0xdf7c3E7f2E9e9E87C6c6A8C2cEeE7A4b4a9b4a9b',
    _userDeposit: '',
    _networkProposal: '',
    _networkWithdraw: '',
    _nodeDeposit: '',
    _networkBalances: '',
    formatNodeCommissionFee: '5',
    formatPlatformCommissionFee: '5',
    formatStackCommissionFee: '10',
    formatMinDeposit: '0',
    trustNodeDepositEnabled: true,
    soloNodeDepositEnabled: true,
    formatSoloNodeDepositAmount: '0',
    updateBalancesEpochs: 10,
    threshold: 5,
    isEntrusted: true,
  });
  const [updateNodeFeeModalOpen, setUpdateNodeFeeModalOpen] = useState(false);
  const [stackFeeModalOpen, setStackFeeModalOpen] = useState(false);
  const [trustEnabledModalOpen, setTrustEnabledModalOpen] = useState(false);
  const [soloEnabledModalOpen, setSoloEnabledModalOpen] = useState(false);
  const [soloDepositModalOpen, setSoloDepositModalOpen] = useState(false);
  const [minDepositModalOpen, setMinDepositModalOpen] = useState(false);
  const [votersModalOpen, setVotersModalOpen] = useState(false);
  const [rewardPeriodModalOpen, setRewardPeriodModalOpen] = useState(false);

  return (
    <div className="mt-[.24rem] bg-bg2 rounded-[.12rem] border border-[#ffffff] px-[.24rem] pt-[.32rem] pb-[.4rem]">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-[.34rem] h-[.34rem] relative mr-[.12rem]">
            <Image src={eth} layout="fill" alt="icon" />
          </div>

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
              setUpdateNodeFeeModalOpen(true);
              settingsPopupState.close();
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Node & Platform Fees
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
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
            className="mt-[.24rem] cursor-pointer hidden items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setRewardPeriodModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Reward Update Period
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setVotersModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">Voters</div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setTrustEnabledModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Enable/Disable Trust Node
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setSoloEnabledModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Enable/Disable Solo Node
            </div>

            <div className="w-[.13rem] h-[.13rem] relative">
              <Image src={edit} layout="fill" alt="icon" />
            </div>
          </div>

          <div
            className="mt-[.24rem] cursor-pointer flex items-center justify-between"
            onClick={() => {
              settingsPopupState.close();
              setSoloDepositModalOpen(true);
            }}
          >
            <div className="text-color-text2 text-[.14rem]">
              Solo Node Deposit Amount
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
          <Link href={getEtherScanAccountUrl(address)} target="_blank">
            <div className="flex items-center justify-between">
              <div className="text-link mr-[.06rem]">LSD Token Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(getFactoryContract().address)}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between flex items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">LSD Factory Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._admin || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between flex items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Owner Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._feePool || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between flex items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Fee Pool Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._userDeposit || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between flex item-center cursor-pointer">
              <div className="text-link mr-[.06rem]">User Deposit Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._networkProposal || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between flex items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">
                Network Proposal Address
              </div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._networkWithdraw || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between flex items-center cursor-pointer">
              <div className="text-link mr-[.06rem]">
                Network Withdraw Address
              </div>
              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._nodeDeposit || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between flex item-center cursor-pointer">
              <div className="text-link mr-[.06rem]">Node Deposit Address</div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          <Link
            href={getEtherScanAccountUrl(dashboardInfo?._networkBalances || '')}
            target="_blank"
          >
            <div className="mt-[.24rem] justify-between flex item-center cursor-pointer">
              <div className="text-link mr-[.06rem]">
                Network Balances Address
              </div>

              <Icomoon icon="share" size=".12rem" />
            </div>
          </Link>

          {dashboardInfo?._voters?.map((voter, index) => (
            <div key={index} className="">
              <Link href={getEtherScanAccountUrl(voter)} target="_blank">
                <div className="mt-[.24rem] justify-between flex items-center cursor-pointer">
                  <div className="text-link mr-[.06rem]">Voter-{index + 1}</div>
                  <Icomoon icon="share" size=".12rem" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Popover>

      <UpdateNodePlatformFeeModal
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
      />

      <UpdateStackFeeModal
        placeholder={
          dashboardInfo ? dashboardInfo.formatStackCommissionFee : ''
        }
        open={stackFeeModalOpen}
        close={() => {
          setStackFeeModalOpen(false);
        }}
      />

      <UpdateTrustEnabledModal
        defaultEnabled={
          dashboardInfo ? dashboardInfo.trustNodeDepositEnabled : false
        }
        open={trustEnabledModalOpen}
        close={() => {
          setTrustEnabledModalOpen(false);
        }}
      />

      <UpdateSoloEnabledModal
        defaultEnabled={
          dashboardInfo ? dashboardInfo.soloNodeDepositEnabled : false
        }
        open={soloEnabledModalOpen}
        close={() => {
          setSoloEnabledModalOpen(false);
        }}
      />

      <UpdateSoloDepositModal
        placeholder={
          dashboardInfo ? dashboardInfo.formatSoloNodeDepositAmount : ''
        }
        open={soloDepositModalOpen}
        close={() => {
          setSoloDepositModalOpen(false);
        }}
      />

      <UpdateMinDepositModal
        placeholder={dashboardInfo ? dashboardInfo.formatMinDeposit : ''}
        open={minDepositModalOpen}
        close={() => {
          setMinDepositModalOpen(false);
        }}
      />

      <UpdateVotersModal
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
      />

      <UpdateRewardPeriodModal
        placeholder={
          dashboardInfo ? dashboardInfo.updateBalancesEpochs.toString() : ''
        }
        open={rewardPeriodModalOpen}
        close={() => {
          setRewardPeriodModalOpen(false);
        }}
      />
    </div>
  );
};

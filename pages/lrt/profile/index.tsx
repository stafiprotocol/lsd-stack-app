import classNames from 'classnames';
import { EthDashboard } from 'components/EthDashboard';
import { LrtDashboard } from 'components/LrtDashboard';
import { ProfileModulePage } from 'components/ProfileModulePage';
import { CustomButton } from 'components/common/CustomButton';
import { getDocHost } from 'config/common';
import { getEthereumChainId } from 'config/eth/env';
import { useAppDispatch } from 'hooks/common';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { AppEco } from 'interfaces/common';
import Image from 'next/image';
import Link from 'next/link';
import empty from 'public/images/empty_bird.svg';
import { useState } from 'react';
import { getInjectedConnector } from 'utils/commonUtils';
import { useConnect } from 'wagmi';

const EthProfilePage = () => {
  const dispatch = useAppDispatch();

  const { metaMaskAccount } = useWalletAccount();

  const { connectors, connectAsync } = useConnect();

  const [tab, setTab] = useState<'stack' | 'module'>('stack');

  const clickWallet = async () => {
    const metamaskConnector = getInjectedConnector(connectors);
    if (!metamaskConnector) {
      return;
    }
    try {
      await connectAsync({
        connector: metamaskConnector,
        chainId: getEthereumChainId(),
      });
    } catch (err: any) {
      if (err.code === 4001) {
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="bg-bgPage pt-[.24rem] pb-[1.05rem]">
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
          <div className="inline-flex h-[.42rem] px-[.04rem] py-[.04rem] text-[.16rem] items-stretch rounded-[.4rem] border border-[#E8EFFD] bg-[#FFFFFF80]">
            <div
              className={classNames(
                ' w-[1.12rem] rounded-[.4rem] flex items-center justify-center cursor-pointer',
                tab === 'stack' ? 'text-white bg-text1' : 'text-text1'
              )}
              onClick={() => {
                setTab('stack');
              }}
            >
              Stack
            </div>

            <div
              className={classNames(
                'w-[1.12rem] rounded-[.4rem] flex items-center justify-center cursor-pointer',
                tab === 'module' ? 'text-white bg-text1' : 'text-text1'
              )}
              onClick={() => {
                setTab('module');
              }}
            >
              Module
            </div>
          </div>

          {!metaMaskAccount ? (
            <div className="flex flex-col items-center">
              <div
                className="relative"
                style={{
                  width: '.4rem',
                  height: '.4rem',
                }}
              >
                <Image src={empty} alt="empty" layout="fill" />
              </div>

              <div className="mt-[.16rem] text-[.14rem] text-color-text2">
                Please connect your wallet to view your LSD deploy history
              </div>

              <div className="mt-[.32rem] flex items-center">
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    clickWallet();
                  }}
                >
                  <CustomButton
                    type="primary"
                    width="1.62rem"
                    className="opacity-50"
                  ></CustomButton>

                  <div className="text-[.16rem] text-text1 absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center">
                    Connect Wallet
                  </div>
                </div>

                <Link href={getDocHost()} target="_blank">
                  <CustomButton
                    type="stroke"
                    width="1.62rem"
                    className="ml-[.32rem]"
                  >
                    View Doc
                  </CustomButton>
                </Link>
              </div>
            </div>
          ) : tab === 'stack' ? (
            <LrtDashboard />
          ) : (
            <ProfileModulePage eco={AppEco.Lrt} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EthProfilePage;

import classNames from 'classnames';
import { EthDashboard } from 'components/EthDashboard';
import { TipBar } from 'components/common/TipBar';
import { RelayType } from 'components/lsd/RelayType';
import { getDocHost } from 'config/common';
import { evmLsdTokens } from 'config/evm';
import { EVM_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import empty from 'public/images/empty_bird.svg';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { CustomButton } from 'components/common/CustomButton';
import Link from 'next/link';
import { useConnect } from 'wagmi';
import { getEthereumChainId } from 'config/eth/env';
import { EvmDashboard } from 'components/EvmDashboard';
import { lsdTokenConfigs } from 'config/cosmos/chain';

export function getStaticProps() {
  return { props: {} };
}

export function getStaticPaths() {
  const tokenPaths = evmLsdTokens.map((lsdToken) => {
    return {
      params: {
        token: lsdToken.symbol,
      },
    };
  });
  return {
    paths: tokenPaths,
    fallback: false,
  };
}

const ParameterPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token } = router.query;
  const { metaMaskAccount } = useWalletAccount();
  const { connectors, connectAsync } = useConnect();

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: EVM_CREATION_STEPS,
        activedIndex: 2,
      })
    );
  }, [dispatch]);

  const lsdTokenConfig =
    evmLsdTokens.find((item) => item.symbol === token) || evmLsdTokens[0];

  const clickWallet = async () => {
    const metamaskConnector = connectors.find((c) => c.name === 'MetaMask');
    if (!metamaskConnector) {
      return;
    }
    try {
      await connectAsync({
        connector: metamaskConnector,
        chainId: lsdTokenConfig.chainId,
      });
    } catch (err: any) {
      if (err.code === 4001) {
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto pb-[1rem]">
      <div className="mt-[.36rem] flex ">
        <div className={classNames('flex-1 min-w-[6.2rem] w-[6.2rem]')}>
          <div className="bg-color-bg2 rounded-[.3rem] pb-[.14rem] border-[.01rem] border-color-border1">
            <div className="text-[.28rem] leading-[.42rem] font-[700] text-text1 text-center mt-[.24rem]">
              Choose LSD Token Type
            </div>

            <div className="flex justify-center gap-[.32rem] mt-[.32rem]">
              <RelayType
                title="Standard"
                desc={
                  <div>
                    Standard LSD Token{' '}
                    <a
                      href="https://github.com/stafiprotocol/evm-lsd-contracts/blob/main/contracts/LsdToken.sol"
                      target="_blank"
                      className="underline text-color-link"
                    >
                      contract
                    </a>
                  </div>
                }
                onChoose={() => router.push(`/evm/${token}/standard`)}
              />
              <RelayType
                title="Customize"
                desc="Please make sure you contact with StaFi team and standard configuration is whitelisted"
                onChoose={() => router.push(`/evm/${token}/customize`)}
              />
            </div>

            <div className="mt-[.24rem] w-[5.31rem] mx-auto">
              <TipBar
                content={
                  <div>
                    Please note that the LSD Token{' '}
                    <span className="text-[#FF2782]">cannot be modified</span>{' '}
                    once it is set.
                  </div>
                }
                link={`${getDocHost()}/docs/develop_evm_lsd/deploy.html#why-lsd-token-could-not-be-changed`}
              />
            </div>
          </div>
        </div>

        <div className="ml-[.87rem] flex-1">
          <div className="flex items-center gap-[.12rem]">
            <a
              className="text-[.24rem] text-text1 leading-[.36rem] underline"
              href={`${getDocHost()}/docs/develop_evm_lsd/deploy.html#which-token-type-should-i-choose`}
              target="_blank"
            >
              Compare Token Types
            </a>
            <div className="relative w-[.12rem] h-[.12rem]">
              <Image src={ExternalLinkImg} alt="link" layout="fill" />
            </div>
          </div>

          <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.27rem] text-text2">
            Standard LSD Token:
            <br />
            - Provided by StaFi Stack
            <br />
            - ERC-20 compatible
            <br />
            - Ready to use
            <br />
            <br />
            Several Precedures required before using Custom LSD Token:
            <br />
            1. Implement your own LST logic which comply with Stack&apos;s
            standards.
            <br />
            2. Deploy your contract
            <br />
            3. Request StaFi Stack Team for whitelisting your token for security
            reason
          </div>
        </div>
      </div>

      <div className="bg-bgPage pt-[.56rem] pb-[1.05rem]">
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
          {metaMaskAccount ? (
            <EvmDashboard lsdTokenConfig={lsdTokenConfig} />
          ) : (
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
                Please connect your wallet to view your EVM deploy history
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ParameterPage;

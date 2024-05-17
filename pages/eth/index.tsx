import classNames from 'classnames';
import { TipBar } from 'components/common/TipBar';
import { RelayType } from 'components/lsd/RelayType';
import { getDocHost } from 'config/common';
import {
  ETH_CUSTOMIZE_CREATION_STEPS,
  ETH_STANDARD_CREATION_STEPS,
} from 'constants/common';
import empty from 'public/images/empty_bird.svg';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { CustomButton } from 'components/common/CustomButton';
import { useConnect } from 'wagmi';
import { getEthereumChainId } from 'config/eth/env';
import Link from 'next/link';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { EthDashboard } from 'components/EthDashboard';

const EthPage = () => {
  const dispatch = useAppDispatch();
  const { creationStepInfo, backRoute } = useAppSelector((state) => state.app);

  const [relayType, setRelayType] = useState<'Standard' | 'Customize'>(
    backRoute === 'tokenStandard' ? 'Customize' : 'Standard'
  );

  const onChooseCustomize = () => {
    dispatch(
      setCreationStepInfo({
        steps: ETH_CUSTOMIZE_CREATION_STEPS,
        activedIndex: 2,
      })
    );
    setRelayType('Customize');
  };

  useEffect(() => {
    if (creationStepInfo.activedIndex === 0) {
      setRelayType('Standard');
    }
  }, [creationStepInfo]);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: ETH_STANDARD_CREATION_STEPS,
        activedIndex: 1,
      })
    );
  }, [dispatch]);

  const { metaMaskAccount } = useWalletAccount();

  const { connectors, connectAsync } = useConnect();

  const clickWallet = async () => {
    const metamaskConnector = connectors.find((c) => c.name === 'MetaMask');
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
      <div
        className="pb-[.56rem]"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) -20.69%, rgba(255, 255, 255, 0.5) 103.45%)',
          boxShadow: '0px 1px 0px #FFFFFF',
        }}
      >
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
          <div className="my-[.36rem] mr-[.56rem]">
            {relayType === 'Standard' ? (
              <RelayTypeSelector onChooseCustomize={onChooseCustomize} />
            ) : (
              <LsdTokenTypeSelector />
            )}
          </div>
        </div>
      </div>

      <div className="bg-bgPage pt-[.56rem] pb-[1.05rem]">
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
          {metaMaskAccount ? (
            <EthDashboard />
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EthPage;

interface RelayTypeSelectorProps {
  onChooseCustomize: () => void;
}

const RelayTypeSelector = ({ onChooseCustomize }: RelayTypeSelectorProps) => {
  const router = useRouter();

  const onChoose = (type: 'standard' | 'customize') => {
    if (type === 'standard') {
      router.push('/eth/standard');
    } else {
      onChooseCustomize();
    }
  };

  return (
    <div className="mt-[.36rem] flex ">
      <div className={classNames('flex-1 min-w-[6.2rem] w-[6.2rem]')}>
        <div className="bg-color-bg2 rounded-[.3rem] pb-[.14rem] border-[.01rem] border-color-border1">
          <div className="text-[.28rem] leading-[.42rem] font-[700] text-text1 text-center mt-[.24rem]">
            Choose Your Relay Type
          </div>

          <div className="flex justify-center gap-[.32rem] mt-[.32rem]">
            <RelayType
              title="Standard"
              desc="Use the unified trust relay service (operated by StaFi Stack DAO)"
              onChoose={() => onChoose('standard')}
            />
            <RelayType
              title="Customize"
              desc="Run the relay service on your own"
              onChoose={() => onChoose('customize')}
            />
          </div>

          <div className="mt-[.24rem] w-[5.31rem] mx-auto">
            <TipBar
              content="You can change into the other mode anytime"
              link={`${getDocHost()}/docs/developethlsd/deploy.html#how-to-switch-to-custom-relay-service`}
            />
          </div>
        </div>
      </div>

      <div className="ml-[.87rem] flex-1">
        <div className="flex items-center gap-[.12rem]">
          <a
            className="text-[.24rem] text-text1 leading-[.36rem] underline"
            href={`${getDocHost()}/docs/developethlsd/deploy.html#which-relay-type-should-i-choose`}
            target="_blank"
          >
            Compare Relay Types
          </a>
          <div className="relative w-[.12rem] h-[.12rem]">
            <Image src={ExternalLinkImg} alt="link" layout="fill" />
          </div>
        </div>

        <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2">
          Standard:
          <br />
          - No Server Needed
          <br />
          - Able to change to custom at anytime
          <br />
          - Operated by StaFi Stack DAO
          <br />
          <br />
          Custom:
          <br />
          - Server required
          <br />
          - Both Execution & Beacon chain RPC required
          <br />
          - At least run 3 relay instances
          <br />- Maintained by your own
        </div>
      </div>
    </div>
  );
};

const LsdTokenTypeSelector = () => {
  const router = useRouter();

  return (
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
                    href="https://github.com/stafiprotocol/eth-lsd-contracts/blob/main/contracts/LsdToken.sol"
                    target="_blank"
                    className="underline text-color-link"
                  >
                    contract
                  </a>
                </div>
              }
              onChoose={() => router.push('/eth/customize/standard')}
            />
            <RelayType
              title="Customize"
              desc="Please make sure you contact with StaFi team and standard configuration is whitelisted"
              onChoose={() => router.push('/eth/customize/customize')}
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
              link={`${getDocHost()}/docs/developethlsd/deploy.html#why-lsd-token-could-not-be-changed`}
            />
          </div>
        </div>
      </div>

      <div className="ml-[.87rem] flex-1">
        <div className="flex items-center gap-[.12rem]">
          <a
            className="text-[.24rem] text-text1 leading-[.36rem] underline"
            href={`${getDocHost()}/docs/developethlsd/deploy.html#which-token-type-should-i-choose`}
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
  );
};

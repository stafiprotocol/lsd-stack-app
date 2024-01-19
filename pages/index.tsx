import classNames from 'classnames';
import Image from 'next/image';
import ExternalLinkImg from 'public/images/external_link.svg';
import { RelayType } from 'components/lsd/RelayType';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { TipBar } from 'components/common/TipBar';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { CUSTOMIZE_CREATION_STEPS } from 'constants/common';

const RelayTypePage = () => {
  const dispatch = useAppDispatch();
  const { creationStepInfo, backRoute } = useAppSelector((state) => state.app);

  const [relayType, setRelayType] = useState<'Standard' | 'Customize'>(
    backRoute === 'tokenStandard' ? 'Customize' : 'Standard'
  );

  const onChooseCustomize = () => {
    dispatch(
      setCreationStepInfo({
        steps: CUSTOMIZE_CREATION_STEPS,
        activedIndex: 1,
      })
    );
    setRelayType('Customize');
  };

  useEffect(() => {
    if (creationStepInfo.activedIndex === 0) {
      setRelayType('Standard');
    }
  }, [creationStepInfo]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        {relayType === 'Standard' ? (
          <RelayTypeSelector onChooseCustomize={onChooseCustomize} />
        ) : (
          <LsdTokenTypeSelector />
        )}
      </div>
    </div>
  );
};

export default RelayTypePage;

interface RelayTypeSelectorProps {
  onChooseCustomize: () => void;
}

const RelayTypeSelector = ({ onChooseCustomize }: RelayTypeSelectorProps) => {
  const router = useRouter();

  const onChoose = (type: 'standard' | 'customize') => {
    if (type === 'standard') {
      router.push('/standard');
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
              desc="Use the unified trust relay service (operated by Stafi Stack DAO)"
              onChoose={() => onChoose('standard')}
            />
            <RelayType
              title="Customarize"
              desc="Run the relay service on your own"
              onChoose={() => onChoose('customize')}
            />
          </div>

          <div className="mt-[.24rem] w-[5.31rem] mx-auto">
            <TipBar
              content="You can change into the other mode anytime"
              link="https://d835jsgd5asjf.cloudfront.net/docs/developethlsd/deploy.html#how-to-switch-to-custom-relay-service"
            />
          </div>
        </div>
      </div>

      <div className="ml-[.87rem] flex-1">
        <div className="flex items-center gap-[.12rem]">
          <a
            className="text-[.24rem] text-text1 leading-[.36rem] underline"
            href="https://d835jsgd5asjf.cloudfront.net/docs/developethlsd/deploy.html#which-relay-type-should-i-choose"
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
              desc="Standard LSD token contract (contract code linked to a GitHub repository)"
              onChoose={() => router.push('/customize/standard')}
            />
            <RelayType
              title="Customize"
              desc="Please make sure you contact with StaFi team and standard configuration is whitelisted"
              onChoose={() => router.push('/customize/customize')}
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
              link="https://d835jsgd5asjf.cloudfront.net/docs/developethlsd/deploy.html#why-lsd-token-could-not-be-changed"
            />
          </div>
        </div>
      </div>

      <div className="ml-[.87rem] flex-1">
        <div className="flex items-center gap-[.12rem]">
          <a
            className="text-[.24rem] text-text1 leading-[.36rem] underline"
            href="https://d835jsgd5asjf.cloudfront.net/docs/developethlsd/deploy.html#which-token-type-should-i-choose"
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

import classNames from 'classnames';
import { TipBar } from 'components/common/TipBar';
import { RelayType } from 'components/lsd/RelayType';
import { getDocHost } from 'config/common';
import {
  ETH_CUSTOMIZE_CREATION_STEPS,
  ETH_STANDARD_CREATION_STEPS,
  LRT_CREATION_STEPS,
} from 'constants/common';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';

const EthPage = () => {
  const dispatch = useAppDispatch();
  const { creationStepInfo, backRoute } = useAppSelector((state) => state.app);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: LRT_CREATION_STEPS,
        activedIndex: 1,
      })
    );
  }, [dispatch]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <LrtTokenTypeSelector />
      </div>
    </div>
  );
};

export default EthPage;

const LrtTokenTypeSelector = () => {
  const router = useRouter();

  return (
    <div className="mt-[.36rem] flex ">
      <div className={classNames('flex-1 min-w-[6.2rem] w-[6.2rem]')}>
        <div className="bg-color-bg2 rounded-[.3rem] pb-[.14rem] border-[.01rem] border-color-border1">
          <div className="text-[.28rem] leading-[.42rem] font-[700] text-text1 text-center mt-[.24rem]">
            Choose LRT Type
          </div>

          <div className="flex justify-center gap-[.32rem] mt-[.32rem]">
            <RelayType
              title="Standard"
              desc={
                <div>
                  Standard LRT{' '}
                  <a
                    href="https://github.com/stafiprotocol/lrd-contracts/blob/main/src/LrdToken.sol"
                    target="_blank"
                    className="underline text-color-link"
                  >
                    contract
                  </a>
                </div>
              }
              onChoose={() => router.push('/lrt/standard')}
            />

            <RelayType
              title="Customize"
              desc="Please make sure you contact with StaFi team and standard configuration is whitelisted"
              onChoose={() => router.push('/lrt/customize')}
            />
          </div>

          <div className="mt-[.24rem] w-[5.31rem] mx-auto">
            <TipBar
              content={
                <div>
                  Please note that the LRT{' '}
                  <span className="text-[#FF2782]">cannot be modified</span>{' '}
                  once it is set.
                </div>
              }
              link={`${getDocHost()}/docs/developlrt/deploy.html#why-lrd-token-could-not-be-changed`}
            />
          </div>
        </div>
      </div>

      <div className="ml-[.87rem] flex-1">
        <div className="flex items-center gap-[.12rem]">
          <a
            className="text-[.24rem] text-text1 leading-[.36rem] underline"
            href={`${getDocHost()}/docs/developlrt/deploy.html#which-token-type-should-i-choose`}
            target="_blank"
          >
            Compare Token Types
          </a>
          <div className="relative w-[.12rem] h-[.12rem]">
            <Image src={ExternalLinkImg} alt="link" layout="fill" />
          </div>
        </div>

        <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.27rem] text-text2">
          Standard LRT:
          <br />
          - Provided by StaFi Stack
          <br />
          - ERC-20 compatible
          <br />
          - Ready to use
          <br />
          <br />
          Several Procedures required before using Custom LRT:
          <br />
          1. Implement your own LRT logic which comply with Stack&apos;s
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

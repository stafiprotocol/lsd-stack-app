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
            Choose LRT Token Type
          </div>

          <div className="flex justify-center gap-[.32rem] mt-[.32rem]">
            <RelayType
              title="Standard"
              desc="Standard LRT token contract (contract code linked to a GitHub repository)"
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
                  Please note that the LRT Token{' '}
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
          Standard LRT Token:
          <br />
          - Provided by StaFi Stack
          <br />
          - ERC-20 compatible
          <br />
          - Ready to use
          <br />
          <br />
          Several Precedures required before using Custom LRT Token:
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

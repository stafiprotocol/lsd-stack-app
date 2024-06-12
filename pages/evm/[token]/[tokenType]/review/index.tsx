import { Skeleton } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { TipBar } from 'components/common/TipBar';
import { DeployReadyModal } from 'components/modal/DeployReadyModal';
import { EvmDeployReadyModal } from 'components/modal/EvmDeployReadyModal';
import { getDocHost } from 'config/common';
import { getFactoryContract } from 'config/eth/contract';
import { evmLsdTokens } from 'config/evm';
import { EVM_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useEvmDeployInfo } from 'hooks/useEvmDeployInfo';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';

export function getStaticProps() {
  return { props: {} };
}

export function getStaticPaths() {
  const paths: any[] = [];
  evmLsdTokens.forEach((token) => {
    paths.push({
      params: {
        token: token.symbol,
        tokenType: 'customize',
      },
    });
    paths.push({
      params: {
        token: token.symbol,
        tokenType: 'standard',
      },
    });
  });

  return {
    paths: paths,
    fallback: false,
  };
}

const ReviewPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token } = router.query;
  const lsdTokenConfig =
    evmLsdTokens.find((item) => item.symbol === token) || evmLsdTokens[0];

  const { fetchLoading, deployInfo } = useEvmDeployInfo(token as string);

  const [readyModalOpened, setReadyModalOpened] = useState(false);

  const onBack = () => {
    router.replace('/');
  };

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: EVM_CREATION_STEPS,
        activedIndex: 4,
      })
    );
  }, [dispatch]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <div className="mt-[.36rem] flex ">
          <div className={classNames('flex-1 min-w-[6.4rem] w-[6.4rem]')}>
            <div className="bg-color-bg2 rounded-[.3rem] pb-[.14rem] border-[.01rem] border-color-border1">
              <div className="text-[.28rem] leading-[.42rem] font-[700] text-text1 text-center mt-[.24rem]">
                Review & Deploy Config
              </div>

              <div className="mt-[.27rem] w-[5.8rem] mx-auto">
                <TipBar
                  content="Please make sure you save the following information"
                  link={`${getDocHost()}/docs/develop_evm_lsd/deploy.html#save-all-the-information-generated`}
                  isWarning
                />
              </div>

              {fetchLoading && (
                <div className="mt-[.32rem] w-[5.8rem] mx-auto">
                  <Skeleton height=".4rem" className="bg-bg3" />
                  <Skeleton height=".4rem" className="bg-bg3" />
                  <Skeleton height=".4rem" className="bg-bg3" />
                </div>
              )}

              {!fetchLoading && !deployInfo && (
                <div className="mt-[.32rem] w-[5.47rem] mx-auto">Empty</div>
              )}

              {!fetchLoading && deployInfo && (
                <div className="mb-[.32rem] max-h-[3.6rem] overflow-y-auto px-[.3rem]">
                  <DeployInfoItem
                    name="LSD Factory address"
                    value={getFactoryContract().address}
                  />

                  <DeployInfoItem
                    name="Owner address"
                    value={deployInfo.ownerAddress}
                  />
                  <DeployInfoItem
                    name="LSD Token address"
                    value={deployInfo.lsdTokenAddress}
                  />
                  <DeployInfoItem
                    name="Stake Manager address"
                    value={deployInfo.stakeManagerAddress}
                  />
                  <DeployInfoItem
                    name="Stake Pool address"
                    value={deployInfo.stakePoolAddress}
                  />
                  <DeployInfoItem name="Validators" value={deployInfo.voters} />
                </div>
              )}

              <div className="w-[5.8rem] mt-[.26rem] mx-auto flex justify-between">
                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  type="stroke"
                  onClick={onBack}
                >
                  Back
                </CustomButton>
                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  onClick={() => setReadyModalOpened(true)}
                  disabled={!deployInfo}
                >
                  Confirm
                </CustomButton>
              </div>
            </div>
          </div>

          <div className="ml-[.87rem] flex-1">
            <div className="flex items-center gap-[.12rem]">
              <a
                className="text-[.24rem] text-text1 leading-[.36rem] underline"
                href={`${getDocHost()}/docs/develop_evm_lsd/deploy.html#step2-run-relay-service`}
                target="_blank"
              >
                How to run your relay service
              </a>
              <div className="relative w-[.12rem] h-[.12rem]">
                <Image src={ExternalLinkImg} alt="link" layout="fill" />
              </div>
            </div>

            <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2">
              Relay is an off-chain service responsible for periodically calling newEra method,
              which will delegate or undelegate, update rate and distribute rewards etc.
              <br />
              Go through with these steps to run a relay service:
              <br />
              - Prepare servers
              <br />
              - Install Relay binary from source code
              <br />
              - Import an account
              <br />- Start relay service
            </div>

            <div className="flex items-center gap-[.12rem] mt-[.3rem]">
              <a
                className="text-[.24rem] text-text1 leading-[.36rem] underline"
                href={`${getDocHost()}/docs/develop_evm_lsd/evm_lsd_app.html`}
                target="_blank"
              >
                How to deploy your own LSD APP
              </a>
              <div className="relative w-[.12rem] h-[.12rem]">
                <Image src={ExternalLinkImg} alt="link" layout="fill" />
              </div>
            </div>

            <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2">
              - Fork the LSD App on GitHub
              <br />
              - Config contract address
              <br />
              - Change branding related text and links
              <br />- Build and deploy it to Static Web Hosting Services
            </div>
          </div>
        </div>
      </div>

      {deployInfo && readyModalOpened && (
        <EvmDeployReadyModal
          lsdTokenConfig={lsdTokenConfig}
          open={readyModalOpened}
          close={() => setReadyModalOpened(false)}
          lsdTokenName={deployInfo.lsdTokenName}
          relayType="customize"
        />
      )}
    </div>
  );
};

export default ReviewPage;

interface DeployInfoItemProps {
  name: string;
  value: string | string[];
}

const DeployInfoItem = ({ name, value }: DeployInfoItemProps) => {
  return (
    <div className="text-[.16rem] leading-[.24rem] text-text1 mt-[.32rem] flex items-end">
      <div className={classNames(Array.isArray(value) ? 'self-start' : '')}>
        {name}:
      </div>
      <div className="text-text2 text-[.14rem] leading-[.21rem] ml-[.04rem]">
        {Array.isArray(value) ? (
          <div className="flex flex-col pt-[.03rem]">
            {value.map((v) => (
              <div key={v} className="mb-[.16rem]">
                {v}
              </div>
            ))}
          </div>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

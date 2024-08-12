import { Program, Idl, AnchorProvider, setProvider } from '@coral-xyz/anchor';
import { Skeleton } from '@mui/material';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { TipBar } from 'components/common/TipBar';
import { LrtDeployReadyModal } from 'components/modal/LrtDeployReadyModal';
import { getDocHost } from 'config/common';
import { getLrtFactoryContract } from 'config/lrt/contract';
import { solanaPrograms } from 'config/sol';
import { IDL, LsdProgram } from 'config/sol/idl/lsd_program';
import { LRT_CREATION_STEPS, SOL_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useLrtDeployInfo } from 'hooks/useLrtDeployInfo';
import { useSolDeployInfo } from 'hooks/useSolDeployInfo';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';

const ReviewPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { fetchLoading, deployInfo } = useSolDeployInfo(
    router.query.stakeManagerAddress as string
  );
  const [readyModalOpened, setReadyModalOpened] = useState(false);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: SOL_CREATION_STEPS,
        activedIndex: 2,
      })
    );
  }, [dispatch]);

  const onBack = () => {
    router.replace('/');
  };

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <div className="mt-[.36rem] flex">
          <div className={classNames('flex-1 min-w-[6.4rem] w-[6.4rem]')}>
            <div className="bg-color-bg2 rounded-[.3rem] pb-[.14rem] border-[.01rem] border-color-border1">
              <div className="text-[.28rem] leading-[.42rem] font-[700] text-text1 text-center mt-[.24rem]">
                Review & Deploy Config
              </div>

              <div className="mt-[.27rem] w-[5.8rem] mx-auto">
                <TipBar
                  content="Please make sure you save the following information"
                  link={`${getDocHost()}/docs/develop_sol_lsd/deploy.html#save-all-the-information-generated`}
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
                    name="Owner address"
                    value={deployInfo.admin.toString()}
                  />
                  {/* <DeployInfoItem
                    name="Balancer address"
                    value={deployInfo.balancer.toString()}
                  /> */}
                  <DeployInfoItem
                    name="LST address"
                    value={deployInfo.lsdTokenMint.toString()}
                  />
                  <DeployInfoItem
                    name="Stack Contract address"
                    value={deployInfo.stack.toString()}
                  />
                  <DeployInfoItem
                    name="Stake Manager address"
                    value={router.query.stakeManagerAddress as string}
                  />
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
                  onClick={() => {
                    router.push(
                      `/sol/module?stakeManagerAddress=${router.query.stakeManagerAddress}`
                    );
                  }}
                  disabled={!deployInfo}
                >
                  Next
                </CustomButton>
                {/* <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  onClick={() => setReadyModalOpened(true)}
                  disabled={!deployInfo}
                >
                  Confirm
                </CustomButton> */}
              </div>
            </div>
          </div>

          <div className="ml-[.87rem] flex-1">
            <div className="flex items-center gap-[.12rem]">
              <a
                className="text-[.24rem] text-text1 leading-[.36rem] underline"
                href={`${getDocHost()}/docs/develop_sol_lsd/relay.html`}
                target="_blank"
              >
                How to run your relay service
              </a>
              <div className="relative w-[.12rem] h-[.12rem]">
                <Image src={ExternalLinkImg} alt="link" layout="fill" />
              </div>
            </div>

            <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2">
              Relay is an off-chain service responsible for interacting with LSD
              contracts. There are two ways to run the relay:
              <br />
              1.{' '}
              <a
                className="underline"
                href="https://discord.com/invite/jB77etn"
                target="_blank"
              >
                Contact with StaFi team
              </a>{' '}
              to whitelist your LST, so that you do not have to maintain the
              Relay service by yourself
              <br />
              2.{' '}
              <a
                className="underline"
                href={`${getDocHost()}/docs/develop_sol_lsd/relay.html`}
                target="_blank"
              >
                Follow our doc
              </a>{' '}
              to run your own Relay service
            </div>

            <div className="flex items-center gap-[.12rem] mt-[.3rem]">
              <a
                className="text-[.24rem] text-text1 leading-[.36rem] underline"
                href={`${getDocHost()}/docs/develop_sol_lsd/lsd_app.html`}
                target="_blank"
              >
                How to build your own LSD App
              </a>
              <div className="relative w-[.12rem] h-[.12rem]">
                <Image src={ExternalLinkImg} alt="link" layout="fill" />
              </div>
            </div>

            <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2">
              - Web3 frontend development technologies required
              <br />
              - Follow the instructions of the documentation to build your own
              LSD App
              <br />
              - Reach out StaFi Stack Team if you need help
              <br />
            </div>
          </div>
        </div>
      </div>

      {/* {deployInfo && readyModalOpened && (
        <LrtDeployReadyModal
          open={readyModalOpened}
          close={() => setReadyModalOpened(false)}
          lrtTokenName={deployInfo.lrtTokenName}
        />
      )} */}
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

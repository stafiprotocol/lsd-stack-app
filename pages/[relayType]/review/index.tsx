import { Skeleton } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { TipBar } from 'components/common/TipBar';
import { DeployReadyModal } from 'components/modal/DeployReadyModal';
import { getFactoryContract } from 'config/contract';
import { useDeployInfo } from 'hooks/useDeployInfo';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useState } from 'react';

const ReviewPage = () => {
  const router = useRouter();

  const { fetchLoading, deployInfo } = useDeployInfo('standard');

  const [readyModalOpened, setReadyModalOpened] = useState(false);

  const onBack = () => {
    router.replace('/');
  };

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
                  link="https://d835jsgd5asjf.cloudfront.net/docs/developethlsd/deploy.html#save-all-the-information-generated"
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
                    name="Fee Pool address"
                    value={deployInfo.feePoolAddress}
                  />
                  <DeployInfoItem
                    name="Network Balances address"
                    value={deployInfo.networkBalancesAddress}
                  />
                  <DeployInfoItem
                    name="Network Proposal address"
                    value={deployInfo.networkProposalAddress}
                  />
                  <DeployInfoItem
                    name="Network Withdraw address"
                    value={deployInfo.networkWithdrawAddress}
                  />
                  <DeployInfoItem
                    name="Node Deposit address"
                    value={deployInfo.nodeDepositAddress}
                  />
                  <DeployInfoItem
                    name="User Deposit address"
                    value={deployInfo.userDepositAddress}
                  />
                  <DeployInfoItem name="Voters" value={deployInfo.voters} />
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
                href="https://d835jsgd5asjf.cloudfront.net/docs/developethlsd/ethlsdapp.html"
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
        <DeployReadyModal
          open={readyModalOpened}
          close={() => setReadyModalOpened(false)}
          lsdTokenName={deployInfo.lsdTokenName}
          relayType="standard"
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

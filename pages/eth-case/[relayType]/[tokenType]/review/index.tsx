import { Skeleton } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { TipBar } from 'components/common/TipBar';
import { DeployReadyModal } from 'components/modal/DeployReadyModal';
import { getDocHost } from 'config/common';
import { getFactoryContract } from 'config/eth/contract';
import { ETH_CUSTOMIZE_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { DeployInfo } from 'hooks/useDeployInfo';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { sleep } from 'utils/commonUtils';

export function getStaticProps() {
  return { props: {} };
}

export function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          relayType: 'customize',
          tokenType: 'customize',
        },
      },
      {
        params: {
          relayType: 'customize',
          tokenType: 'standard',
        },
      },
    ],
    fallback: false,
  };
}

const ReviewPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [deployInfo, setDeployInfo] = useState<DeployInfo | undefined>(
    undefined
  );

  const [readyModalOpened, setReadyModalOpened] = useState(false);

  const onBack = () => {
    router.replace('/');
  };

  const mockFetch = async () => {
    await sleep(1000);
    setFetchLoading(false);

    setDeployInfo({
      ownerAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      lsdTokenAddress: '0xF05F0f14bF27cFf32c4bC3E84e480aa805330Db1',
      feePoolAddress: '0xB3e1be012FCE61945B0841be277E708040ED8E8F',
      networkBalancesAddress: '0xa7f761969E19769499f7681cC67FF03EF53Fb13B',
      networkProposalAddress: '0x1Fe48ee6F850db0a4717b2F807742fa12de73504',
      networkWithdrawAddress: '0x8e697589aA4ae35540f53F8C93068d19302BA2D5',
      nodeDepositAddress: '0x1D8f7EA16eD32B222F3710A532d6598fC209BB20',
      userDepositAddress: '0x17D3f36fee98a0b47C39d05D0748816De7a255Ae',
      voters: [
        '0x51a1cb1efda3eC0fbBb1748B3a55FCAB2154aDcE',
        '0xFb8d9179C0741285f3623146a390D07c0f83Bb82',
        '0x5b01439ab024Ba75B7B1f9c05aB55fa25e402809',
      ],
      lsdTokenName: 'rETH',
    });
  };

  useEffect(() => {
    mockFetch();
  }, []);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: ETH_CUSTOMIZE_CREATION_STEPS,
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
                  link={`${getDocHost()}/developethlsd/deploy/#save-all-the-information-generated`}
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
                  onClick={() => {
                    router.push(
                      `/eth-case/customize/${params.tokenType}/module`
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
                href={`${getDocHost()}/develop_eth_lsd/deploy/#step2-run-relay-service`}
                target="_blank"
              >
                How to run your relay service
              </a>
              <div className="relative w-[.12rem] h-[.12rem]">
                <Image src={ExternalLinkImg} alt="link" layout="fill" />
              </div>
            </div>

            <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2">
              Relay is an off-chain service responsible for interacting with Eth
              LSD contracts, synchronizing blocks and events, handling tasks
              related to validators and balances, and other off-chain
              operations. Go through with these steps to run a relay service:
              <br />
              - Prepare servers
              <br />
              - Install Relay binary from source code
              <br />
              - Import voter account
              <br />- Start relay service
            </div>

            <div className="flex items-center gap-[.12rem] mt-[.3rem]">
              <a
                className="text-[.24rem] text-text1 leading-[.36rem] underline"
                href={`${getDocHost()}/develop_eth_lsd/ethlsdapp/`}
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

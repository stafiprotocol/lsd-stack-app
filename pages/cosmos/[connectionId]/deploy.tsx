import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { DataLoading } from 'components/common/DataLoading';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { TipBar } from 'components/common/TipBar';
import { Icomoon } from 'components/icon/Icomoon';
import { getNeutronStakeManagerContract } from 'config/cosmos/contract';
import { robotoBold } from 'config/font';
import { COSMOS_CREATION_STEPS } from 'constants/common';
import { LsdToken } from 'gen/neutron';
import { useAppDispatch } from 'hooks/common';
import Image from 'next/image';
import { useRouter } from 'next/router';
import celebrateIcon from 'public/images/celebrate.png';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { openLink } from 'utils/commonUtils';
import { getNeutronWasmClient, getStakeManagerClient } from 'utils/cosmosUtils';
import { chainAmountToHuman, formatNumber } from 'utils/numberUtils';
import { getShortAddress } from 'utils/stringUtils';
import { formatDuration } from 'utils/timeUtils';

const DeployPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [lsdTokenSymbol, setLsdTokenSymbol] = useState('');

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: COSMOS_CREATION_STEPS,
        activedIndex: 4,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (router.isReady) {
      if (router.query.poolAddr && typeof router.query.poolAddr === 'string') {
        (async () => {
          const stakeManagerClient = await getStakeManagerClient();
          const poolInfo = await stakeManagerClient.queryPoolInfo({
            pool_addr: router.query.poolAddr as string,
          });

          console.log({ poolInfo });

          const wasmClient = await getNeutronWasmClient();
          const lsdTokenClient = new LsdToken.Client(
            wasmClient,
            poolInfo.lsd_token
          );
          const tokenInfo = await lsdTokenClient.queryTokenInfo();
          console.log({ tokenInfo });
          if (tokenInfo) {
            setLsdTokenSymbol(tokenInfo.symbol);
          }
        })();
      }
    }
  }, [router]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto pb-[1rem]">
      <div className="flex justify-center">
        <div
          className=" w-[11.32rem] mt-[.32rem] cursor-pointer h-[.56rem] mx-[.24rem] rounded-[.16rem] flex items-center justify-between pl-[.12rem] pr-[.18rem] border-solid border-[1px] border-[#DEE6F7]"
          style={{
            background:
              'linear-gradient(90.05deg, rgba(128, 202, 255, 0.3) 30%, rgba(128, 202, 255, 0.05) 96.37%)',
          }}
          onClick={() => {
            openLink('https://www.google.com');
          }}
        >
          <div className="flex items-center">
            <div className="w-[.2rem] h-[.23rem] relative">
              <Image src={celebrateIcon} alt="icon" layout="fill" />
            </div>

            <div className="ml-[.06rem] text-color-text2 text-[.14rem]">
              <span
                className={classNames(robotoBold.className, 'text-color-text1')}
              >
                {lsdTokenSymbol} Is Ready Now!
              </span>{' '}
              Now you can{' '}
              <span className={'text-color-text1'}>run your relay service</span>{' '}
              and{' '}
              <span className={'text-color-text1'}>
                deploy your own LSD app
              </span>
              , Congratulations!
            </div>
          </div>

          <Icomoon icon="right" color="#6C86AD" size=".11rem" />
        </div>
      </div>

      <div className="flex justify-center mt-[.42rem]">
        <FormCard title="Following Deployment">
          <div className="flex items-center flex-col">
            <div>
              <div className="mt-[.52rem] flex items-center">
                <div
                  className={classNames(
                    robotoBold.className,
                    'rounded-full w-[.42rem] h-[.42rem] bg-[#DEE6F7] text-color-text1 text-[.14rem] flex items-center justify-center'
                  )}
                >
                  4.1
                </div>

                <div className={'ml-[.16rem] text-color-text1 text-[.16rem]'}>
                  Deploy your LSD relay Service
                </div>
              </div>

              <div className="self-start ml-[.20rem] h-[.32rem] w-[2px] bg-[#6C86AD80]" />

              <div className="flex items-center">
                <div
                  className={classNames(
                    robotoBold.className,
                    'rounded-full w-[.42rem] h-[.42rem] bg-[#DEE6F7] text-color-text1 text-[.14rem] flex items-center justify-center'
                  )}
                >
                  4.2
                </div>

                <div className={'ml-[.16rem] text-color-text1 text-[.16rem]'}>
                  Deploy your ICQ relay Service
                </div>
              </div>

              <div className="self-start ml-[.20rem] h-[.32rem] w-[2px] bg-[#6C86AD80]" />

              <div className="flex items-center">
                <div
                  className={classNames(
                    robotoBold.className,
                    'rounded-full w-[.42rem] h-[.42rem] bg-[#DEE6F7] text-color-text1 text-[.14rem] flex items-center justify-center'
                  )}
                >
                  4.3
                </div>

                <div className={'ml-[.16rem] text-color-text1 text-[.16rem]'}>
                  Deploy your Own LSD APP
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[.56rem] flex justify-between mb-[.36rem]">
            <CustomButton
              type="stroke"
              height=".56rem"
              onClick={() => openLink('https://discord.com/invite/jB77etn')}
              width="5.07rem"
            >
              Contact Us
            </CustomButton>
          </div>
        </FormCard>

        <FaqCard title="LSD Token Name" link="">
          <>
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
          </>
        </FaqCard>
      </div>
    </div>
  );
};

export default DeployPage;
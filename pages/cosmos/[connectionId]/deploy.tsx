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

  const [showFollowingPage, setShowFollowingPage] = useState(false);

  const [adminAddress, setAdminAddress] = useState('');
  const [lsdTokenAddress, setLsdTokenAddress] = useState('');
  const [feeCommision, setFeeCommision] = useState('');
  const [feeReceiver, setFeeReceiver] = useState('');
  const [minimalStake, setMinimalStake] = useState('');
  const [lsdTokenCodeId, setLsdTokenCodeId] = useState('');
  const [lsdTokenName, setLsdTokenName] = useState('');
  const [lsdTokenSymbol, setLsdTokenSymbol] = useState('');
  const [validatorAddrs, setValidatorAddrs] = useState<string[]>([]);
  const [eraSeconds, setEraSeconds] = useState('');
  const [unbondingPeriod, setUnbondingPeriod] = useState('');

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: COSMOS_CREATION_STEPS,
        activedIndex: 3,
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

          if (poolInfo) {
            setFeeCommision(
              chainAmountToHuman(poolInfo.platform_fee_commission, 4)
            );
            setFeeReceiver(poolInfo.platform_fee_receiver);
            setAdminAddress(poolInfo.admin);
            setValidatorAddrs(poolInfo.validator_addrs);
            setMinimalStake(chainAmountToHuman(poolInfo.minimal_stake, 6));
            setEraSeconds(poolInfo.era_seconds + '');
            setUnbondingPeriod(poolInfo.unbonding_period + '');
            setLsdTokenAddress(poolInfo.lsd_token);
          }

          const wasmClient = await getNeutronWasmClient();
          const lsdTokenClient = new LsdToken.Client(
            wasmClient,
            poolInfo.lsd_token
          );
          const tokenInfo = await lsdTokenClient.queryTokenInfo();
          console.log({ tokenInfo });
          if (tokenInfo) {
            setLsdTokenName(tokenInfo.name);
            setLsdTokenSymbol(tokenInfo.symbol);
          }
        })();
      }
    }
  }, [router]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto pb-[1rem]">
      {showFollowingPage && (
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
                  className={classNames(
                    robotoBold.className,
                    'text-color-text1'
                  )}
                >
                  {lsdTokenSymbol} Is Ready Now!
                </span>{' '}
                Now you can{' '}
                <span className={'text-color-text1'}>
                  run your relay service
                </span>{' '}
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
      )}

      <div className="flex justify-center mt-[.42rem]">
        {!showFollowingPage ? (
          <FormCard title="Review & Deploy Config">
            <TipBar
              isWarning
              content={
                <div>Please make sure you save the following information</div>
              }
              link="https://www.google.com"
              className="mt-[.16rem]"
            />

            <div className="h-[4.5rem] overflow-auto max-h-[4.5rem]">
              <div
                className={classNames(
                  'mt-[.3rem] text-[.14rem] text-text1 flex items-center'
                )}
              >
                <div className="mr-[.06rem] min-w-[1.1rem]">Owner Address:</div>

                {adminAddress ? (
                  <span className={'text-text2'}>{adminAddress}</span>
                ) : (
                  <DataLoading height=".14rem" width="1rem" />
                )}
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem] min-w-[1.7rem]">
                  Stake Manager Contract:
                </div>

                <span className={'text-text2 break-all'}>
                  {getNeutronStakeManagerContract()}
                </span>
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem]  min-w-[1.4rem]">
                  Lsd Token Contract:
                </div>

                {lsdTokenAddress ? (
                  <span className={'text-text2 break-all'}>
                    {lsdTokenAddress}
                  </span>
                ) : (
                  <DataLoading height=".14rem" width="1rem" />
                )}
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem]">Lsd Token Name:</div>

                {lsdTokenName ? (
                  <span className={'text-text2'}>{lsdTokenName}</span>
                ) : (
                  <DataLoading height=".14rem" width="1rem" />
                )}
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem]">Lsd Token Symbol:</div>

                {lsdTokenSymbol ? (
                  <span className={'text-text2'}>{lsdTokenSymbol}</span>
                ) : (
                  <DataLoading height=".14rem" width="1rem" />
                )}
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem] min-w-[1.4rem]">
                  Validator Addresses:
                </div>

                <div>
                  {validatorAddrs.map((addr, index) => (
                    <div key={index} className="text-text2 break-all">
                      {addr}
                    </div>
                  ))}
                </div>
              </div>

              {/* {validatorAddrs.map((addr, index) => (
                <div
                  key={index}
                  className={classNames(
                    'mt-[.24rem] text-[.14rem] text-text1 flex'
                  )}
                >
                  <div className="mr-[.06rem]">
                    Validator Address{index + 1}:
                  </div>
                  <span className={'text-text2'}>
                    {getShortAddress(addr, 20)}
                  </span>
                </div>
              ))} */}

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem] min-w-[1rem]">Fee Receiver:</div>

                {feeReceiver ? (
                  <span className={'text-text2 break-all'}>{feeReceiver}</span>
                ) : (
                  <DataLoading height=".14rem" width="1rem" />
                )}
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem]">Fee Commission:</div>

                {feeCommision ? (
                  <span className={'text-text2'}>{feeCommision}%</span>
                ) : (
                  <DataLoading height=".14rem" width="1rem" />
                )}
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem]">Minimal Stake Amount:</div>

                {minimalStake ? (
                  <span className={'text-text2'}>
                    {formatNumber(minimalStake, { fixedDecimals: false })}
                  </span>
                ) : (
                  <DataLoading height=".14rem" width="1rem" />
                )}
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem]">Era Period:</div>

                {eraSeconds ? (
                  <span className={'text-text2'}>
                    {formatNumber(Number(eraSeconds) / (60 * 60), {
                      fixedDecimals: false,
                      decimals: 2,
                    })}{' '}
                    Hours
                  </span>
                ) : (
                  <DataLoading height=".14rem" width="1rem" />
                )}
              </div>

              <div
                className={classNames(
                  'mt-[.24rem] text-[.14rem] text-text1 flex'
                )}
              >
                <div className="mr-[.06rem]">Unbonding Period:</div>

                {eraSeconds ? (
                  <span className={'text-text2'}>
                    {formatDuration(
                      Number(eraSeconds) * Number(unbondingPeriod) * 1000
                    )}
                  </span>
                ) : (
                  <DataLoading height=".14rem" width="1rem" />
                )}
              </div>
            </div>

            <div className="mt-[.36rem] flex justify-between mb-[.36rem]">
              <CustomButton
                type="stroke"
                height=".56rem"
                onClick={() => openLink('https://www.google.com')}
                width="2.62rem"
              >
                Re-edit Params
              </CustomButton>

              <CustomButton
                type="primary"
                height=".56rem"
                width="2.62rem"
                onClick={() => {
                  dispatch(
                    setCreationStepInfo({
                      steps: COSMOS_CREATION_STEPS,
                      activedIndex: 4,
                    })
                  );
                  setShowFollowingPage(true);
                }}
              >
                Confirm
              </CustomButton>
            </div>
          </FormCard>
        ) : (
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
        )}

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

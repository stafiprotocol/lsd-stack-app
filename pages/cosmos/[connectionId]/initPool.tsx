import { checkAddress } from '@stafihub/apps-wallet';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { DataLoading } from 'components/common/DataLoading';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { CosmosSubmitConfirmModal } from 'components/modal/CosmosSubmitConfirmModal';
import { getDocHost } from 'config/common';
import { lsdTokenConfigs, neutronChainConfig } from 'config/cosmos/chain';
import { getNeutronStakeManagerContract } from 'config/cosmos/contract';
import { COSMOS_CREATION_STEPS } from 'constants/common';
import { LsdToken } from 'gen/neutron';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
import { LsdTokenConfig } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { cosmosInitPool } from 'redux/reducers/CosmosLsdSlice';
import { RootState } from 'redux/store';
import { openLink } from 'utils/commonUtils';
import { getNeutronWasmClient, getStakeManagerClient } from 'utils/cosmosUtils';
import { chainAmountToHuman, formatNumber } from 'utils/numberUtils';
import snackbarUtil from 'utils/snackbarUtils';
import { formatDuration } from 'utils/timeUtils';

const InitPoolPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [interChainAccountId, setInterChainAccountId] = useState('');
  const [lsdTokenChainConfig, setLsdTokenChainConfig] =
    useState<LsdTokenConfig>();
  const [feeReceiver, setFeeReceiver] = useState(
    ''
    // 'neutron1gn54y6lmkhchan2cy9fxzt8v6j6crq6huays6m'
  );
  const [showValidatorPage, setShowValidatorPage] = useState(false);
  const [showReviewPage, setShowReviewPage] = useState(false);
  const [feeCommision, setFeeCommision] = useState('');
  const [minimalStake, setMinimalStake] = useState('');
  const [lsdTokenCodeId, setLsdTokenCodeId] = useState('');
  const [lsdTokenName, setLsdTokenName] = useState('');
  const [lsdTokenSymbol, setLsdTokenSymbol] = useState('');
  const [validatorAddrAmount, setValidatorAddrAmount] = useState('1');
  const [validatorAddrs, setValidatorAddrs] = useState<string[]>([
    '',
    // 'cosmosvaloper1jke3a48tpnqlq6ck7eccm6qh5lppeq3ydqxk5p',
  ]);
  const [poolAddr, setPoolAddr] = useState('');

  const neutronChainAccount = useCosmosChainAccount(neutronChainConfig.chainId);

  const { cosmosEcoLoading } = useAppSelector((state: RootState) => {
    return {
      cosmosEcoLoading: state.cosmosLsd.cosmosEcoLoading,
    };
  });

  const realFeeCommission = useMemo(() => {
    return (
      feeCommision ||
      chainAmountToHuman(lsdTokenChainConfig?.defaultFeeCommission)
    );
  }, [feeCommision, lsdTokenChainConfig]);

  const { submitModalDisabled } = useMemo(() => {
    if (!neutronChainAccount) {
      return {
        submitModalDisabled: true,
      };
    }
    if (validatorAddrs.length === 0) {
      return {
        submitModalDisabled: true,
      };
    }
    let hasEmpty = false;
    validatorAddrs.forEach((addr) => {
      if (!addr) {
        hasEmpty = true;
      }
    });
    return {
      submitModalDisabled: hasEmpty,
    };
  }, [validatorAddrs, neutronChainAccount]);

  useEffect(() => {
    if (router.isReady) {
      if (
        !router.query.interChainAccountId ||
        typeof router.query.interChainAccountId !== 'string'
      ) {
        router.replace('/cosmos');
      } else {
        setInterChainAccountId(router.query.interChainAccountId);
      }

      const matched = lsdTokenConfigs.find(
        (item) => item.connectionId === router.query.connectionId
      );
      if (!matched) {
        router.replace('/cosmos');
        return;
      }
      setLsdTokenChainConfig(matched);
      setFeeCommision(
        chainAmountToHuman(matched.defaultFeeCommission, 4) || '10'
      );
      setLsdTokenCodeId(matched.lsdTokenCodeId || '');
    }
  }, [router]);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: COSMOS_CREATION_STEPS,
        activedIndex: 3,
      })
    );
  }, [dispatch]);

  const submit = async () => {
    if (!lsdTokenChainConfig) {
      snackbarUtil.error('Lsd Token Config not found');
      return;
    }

    dispatch(
      cosmosInitPool(
        interChainAccountId,
        lsdTokenName,
        lsdTokenSymbol,
        minimalStake,
        realFeeCommission,
        feeReceiver,
        validatorAddrs,
        lsdTokenChainConfig,
        (poolAddr) => {
          if (poolAddr) {
            setShowReviewPage(true);
            setPoolAddr(poolAddr);
          }
        }
      )
    );
  };

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto pb-[1rem]">
      <div className="flex justify-center mt-[.42rem]">
        {showReviewPage ? (
          <ReviewPage
            poolAddr={poolAddr}
            connectionId={lsdTokenChainConfig?.connectionId}
          />
        ) : !showValidatorPage ? (
          <FormCard title="Set Parameters">
            <>
              <InputItem
                label="Interchain Account ID"
                placeholder="Interchain Account ID"
                value={interChainAccountId}
                onChange={() => {}}
                disabled
                className="mt-[.32rem]"
              />

              <InputItem
                label="Fee Receiver"
                placeholder="Please enter the Neutron address for the fee recipient"
                value={feeReceiver}
                onChange={(v) => {
                  setFeeReceiver(v);
                }}
                className="mt-[.16rem]"
              />

              <InputItem
                label="Fee Commission"
                placeholder={
                  chainAmountToHuman(
                    lsdTokenChainConfig?.defaultFeeCommission,
                    4
                  ) + '' || 'Fee Commission'
                }
                suffix="%"
                isNumber
                value={feeCommision}
                onChange={(v) => {
                  setFeeCommision(v);
                }}
                className="mt-[.16rem]"
              />

              {Number(feeCommision) > 100 && (
                <div className="my-[.16rem] text-[.16rem] text-error">
                  Fee Commission must be {'<='}100
                </div>
              )}

              <InputItem
                label="Minimal Stake"
                placeholder={'Minimal Stake Amount'}
                isNumber
                value={minimalStake}
                onChange={(v) => {
                  setMinimalStake(v);
                }}
                className="mt-[.16rem]"
              />

              <InputItem
                label="LSD Token Code ID"
                placeholder={
                  lsdTokenChainConfig?.lsdTokenCodeId || 'LSD Token Code ID'
                }
                value={lsdTokenCodeId}
                onChange={(v) => {
                  setLsdTokenCodeId(v);
                }}
                className="mt-[.16rem]"
              />

              <InputItem
                label="LSD Token Name"
                placeholder="Example: StaFi rATOM"
                value={lsdTokenName}
                onChange={(v) => {
                  setLsdTokenName(v);
                }}
                className="mt-[.16rem]"
              />

              <InputItem
                label="LSD Token Symbol"
                placeholder="Example: rATOM"
                value={lsdTokenSymbol}
                onChange={(v) => {
                  setLsdTokenSymbol(v);
                }}
                className="mt-[.16rem]"
              />

              <InputItem
                label="Validator Addr Amount"
                placeholder="Validator Addr Amount"
                value={validatorAddrAmount}
                showAddMinusButton
                isInteger
                min={1}
                max={10}
                onChange={(v) => {
                  setValidatorAddrAmount(v);
                  const validatorAddrs = [];
                  for (let i = 0; i < Number(v); i++) {
                    validatorAddrs.push('');
                  }
                  setValidatorAddrs(validatorAddrs);
                }}
                className="mt-[.16rem]"
              />

              {Number(validatorAddrAmount) < 1 ||
                (Number(validatorAddrAmount) > 10 && (
                  <div className="my-[.16rem] text-[.16rem] text-error">
                    Validator Addr Amount must be between 1~10
                  </div>
                ))}

              <TipBar
                content={
                  <div>
                    Commission fee is set defaults as 10%, StaFi Stack Fee set
                    as 10%.
                  </div>
                }
                link="https://www.google.com"
                className="mt-[.16rem]"
              />

              <div className="mt-[.24rem] flex justify-between mb-[.36rem]">
                <CustomButton
                  type="stroke"
                  height=".56rem"
                  onClick={() => router.back()}
                  width="2.62rem"
                >
                  Back
                </CustomButton>

                <CustomButton
                  type="primary"
                  height=".56rem"
                  width="2.62rem"
                  disabled={
                    !feeReceiver ||
                    !minimalStake ||
                    !lsdTokenName ||
                    !lsdTokenSymbol ||
                    Number(validatorAddrAmount) < 1 ||
                    Number(validatorAddrAmount) > 10 ||
                    Number(feeCommision) > 100
                  }
                  onClick={() => {
                    if (
                      !checkAddress(
                        feeReceiver,
                        neutronChainConfig.bech32Config.bech32PrefixAccAddr
                      )
                    ) {
                      snackbarUtil.error('Invalid Fee Receiver Address format');
                      return;
                    }

                    if (isNaN(Number(realFeeCommission))) {
                      snackbarUtil.error('Invalid fee commission');
                      return;
                    }

                    setShowValidatorPage(true);
                  }}
                >
                  Next
                </CustomButton>
              </div>
            </>
          </FormCard>
        ) : (
          <FormCard title="Validator Address">
            <>
              <InputItem
                label="Validator Addr Amount"
                value={validatorAddrAmount}
                onChange={() => {}}
                placeholder=""
                disabled
                className="mt-[.33rem]"
              />

              <div className="max-h-[2.5rem] overflow-auto">
                {validatorAddrs.map((validatorAddr, index) => (
                  <InputItem
                    key={index}
                    label={`Validator ${index + 1}`}
                    placeholder={`Exmaple: ${lsdTokenChainConfig?.bech32PrefixValAddr}0000000000000`}
                    value={validatorAddr}
                    onChange={(v) => {
                      const newAddrs = [...validatorAddrs];
                      newAddrs[index] = v;
                      setValidatorAddrs(newAddrs);
                    }}
                    className="mt-[.16rem]"
                  />
                ))}
              </div>

              <div className="mt-[.57rem] mb-[.36rem] flex justify-between">
                <CustomButton
                  type="stroke"
                  height=".56rem"
                  width="2.62rem"
                  onClick={() => {
                    setShowValidatorPage(false);
                  }}
                >
                  Back
                </CustomButton>

                <CustomButton
                  type="primary"
                  height=".56rem"
                  width="2.62rem"
                  disabled={submitModalDisabled}
                  loading={cosmosEcoLoading}
                  onClick={() => {
                    let hasInvalidAddress = false;
                    validatorAddrs.forEach((addr) => {
                      if (
                        !checkAddress(
                          addr,
                          lsdTokenChainConfig?.bech32PrefixValAddr || ''
                        )
                      ) {
                        hasInvalidAddress = true;
                      }
                    });
                    if (hasInvalidAddress) {
                      snackbarUtil.error('Invalid Validator Address format');
                      return;
                    }

                    setConfirmModalVisible(true);
                  }}
                >
                  Submit
                </CustomButton>
              </div>
            </>
          </FormCard>
        )}

        <FaqCard title="LSD Token Name" link="https://www.google.com">
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

      <CosmosSubmitConfirmModal
        open={confirmModalVisible}
        close={() => {
          setConfirmModalVisible(false);
        }}
        confirm={() => {
          setConfirmModalVisible(false);
          submit();
        }}
        data={{
          feeCommision: feeCommision,
          feeReceiver: feeReceiver,
          minimalStake: minimalStake,
          lsdTokenCodeId: lsdTokenCodeId,
          lsdTokenName: lsdTokenName,
          lsdTokenSymbol: lsdTokenSymbol,
          validatorAddrs: validatorAddrs,
        }}
      />
    </div>
  );
};

export default InitPoolPage;

const ReviewPage = (props: { poolAddr: string; connectionId?: string }) => {
  const { poolAddr, connectionId } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [adminAddress, setAdminAddress] = useState('');
  const [lsdTokenAddress, setLsdTokenAddress] = useState('');
  const [feeCommision, setFeeCommision] = useState('');
  const [feeReceiver, setFeeReceiver] = useState('');
  const [minimalStake, setMinimalStake] = useState('');
  const [lsdTokenName, setLsdTokenName] = useState('');
  const [lsdTokenSymbol, setLsdTokenSymbol] = useState('');
  const [validatorAddrs, setValidatorAddrs] = useState<string[]>([]);
  const [eraSeconds, setEraSeconds] = useState('');
  const [unbondingPeriod, setUnbondingPeriod] = useState('');

  useEffect(() => {
    (async () => {
      const stakeManagerClient = await getStakeManagerClient();
      const poolInfo = await stakeManagerClient.queryPoolInfo({
        pool_addr: poolAddr,
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
  }, [poolAddr]);

  return (
    <FormCard title="Review & Deploy Config">
      <TipBar
        isWarning
        content={<div>Please back up the following information</div>}
        link={`${getDocHost()}/docs/developethlsd/deploy.html#save-all-the-information-generated`}
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
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
        >
          <div className="mr-[.06rem] min-w-[1.7rem]">
            Stake Manager Contract:
          </div>

          <span className={'text-text2 break-all'}>
            {getNeutronStakeManagerContract()}
          </span>
        </div>

        <div
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
        >
          <div className="mr-[.06rem]  min-w-[1.4rem]">Lsd Token Contract:</div>

          {lsdTokenAddress ? (
            <span className={'text-text2 break-all'}>{lsdTokenAddress}</span>
          ) : (
            <DataLoading height=".14rem" width="1rem" />
          )}
        </div>

        <div
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
        >
          <div className="mr-[.06rem]">Lsd Token Name:</div>

          {lsdTokenName ? (
            <span className={'text-text2'}>{lsdTokenName}</span>
          ) : (
            <DataLoading height=".14rem" width="1rem" />
          )}
        </div>

        <div
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
        >
          <div className="mr-[.06rem]">Lsd Token Symbol:</div>

          {lsdTokenSymbol ? (
            <span className={'text-text2'}>{lsdTokenSymbol}</span>
          ) : (
            <DataLoading height=".14rem" width="1rem" />
          )}
        </div>

        <div
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
        >
          <div className="mr-[.06rem] min-w-[1.4rem]">Validator Addresses:</div>

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
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
        >
          <div className="mr-[.06rem] min-w-[1rem]">Fee Receiver:</div>

          {feeReceiver ? (
            <span className={'text-text2 break-all'}>{feeReceiver}</span>
          ) : (
            <DataLoading height=".14rem" width="1rem" />
          )}
        </div>

        <div
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
        >
          <div className="mr-[.06rem]">Fee Commission:</div>

          {feeCommision ? (
            <span className={'text-text2'}>{feeCommision}%</span>
          ) : (
            <DataLoading height=".14rem" width="1rem" />
          )}
        </div>

        <div
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
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
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
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
          className={classNames('mt-[.24rem] text-[.14rem] text-text1 flex')}
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
            router.push({
              pathname: '/cosmos/[connectionId]/deploy',
              query: {
                ...router.query,
                connectionId: connectionId,
                poolAddr: poolAddr,
              },
            });
          }}
        >
          Confirm
        </CustomButton>
      </div>
    </FormCard>
  );
};
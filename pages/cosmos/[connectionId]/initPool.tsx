import { checkAddress } from '@stafihub/apps-wallet';
import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { CosmosSubmitConfirmModal } from 'components/modal/CosmosSubmitConfirmModal';
import { lsdTokenConfigs, neutronChainConfig } from 'config/cosmos/chain';
import { COSMOS_CREATION_STEPS } from 'constants/common';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
import { LsdTokenConfig } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { cosmosInitPool } from 'redux/reducers/CosmosLsdSlice';
import { RootState } from 'redux/store';
import { chainAmountToHuman } from 'utils/numberUtils';
import snackbarUtil from 'utils/snackbarUtils';

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
            router.push({
              pathname: '/cosmos/[connectionId]/deploy',
              query: {
                ...router.query,
                connectionId: lsdTokenChainConfig?.connectionId,
                poolAddr: poolAddr,
              },
            });
          }
        }
      )
    );
  };

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto pb-[1rem]">
      <div className="flex justify-center mt-[.42rem]">
        {!showValidatorPage ? (
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
                    Number(validatorAddrAmount) > 10
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

const ValidatorSet = () => {};

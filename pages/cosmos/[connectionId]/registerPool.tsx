import { CustomButton } from 'components/common/CustomButton';
import { DataLoading } from 'components/common/DataLoading';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { lsdTokenConfigs, neutronChainConfig } from 'config/cosmos/chain';
import { COSMOS_CREATION_STEPS } from 'constants/common';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
import { usePrice } from 'hooks/usePrice';
import { LsdTokenConfig } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { cosmosRegisterPool } from 'redux/reducers/CosmosLsdSlice';
import { RootState } from 'redux/store';
import { chainAmountToHuman, formatNumber } from 'utils/numberUtils';
import snackbarUtil from 'utils/snackbarUtils';

const RegisterPoolPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [interChainAccountId, setInterChainAccountId] = useState('');
  const [registerFee, setRegisterFee] = useState<string>();
  const [lsdTokenChainConfig, setLsdTokenChainConfig] =
    useState<LsdTokenConfig>();

  const { cosmosEcoLoading } = useAppSelector((state: RootState) => {
    return {
      cosmosEcoLoading: state.cosmosLsd.cosmosEcoLoading,
    };
  });
  const neutronChainAccount = useCosmosChainAccount(neutronChainConfig.chainId);
  const { ntrnPrice } = usePrice();

  useEffect(() => {
    if (router.isReady) {
      if (
        !router.query.connectionId ||
        typeof router.query.connectionId !== 'string'
      ) {
        router.replace('/cosmos');
      } else {
        const matched = lsdTokenConfigs.find(
          (item) => item.connectionId === router.query.connectionId
        );
        setLsdTokenChainConfig(matched);
      }
    }
  }, [router]);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: COSMOS_CREATION_STEPS,
        activedIndex: 2,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      console.log({ ntrnPrice });
      if (!ntrnPrice || isNaN(Number(ntrnPrice))) {
        return;
      }
      const fundResponse = await fetch(
        'https://rest-falcron.pion-1.ntrn.tech/neutron/interchaintxs/params',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const fundResponseJson = await fundResponse.json();
      if (
        fundResponseJson.params.register_fee &&
        fundResponseJson.params.register_fee.length > 0
      ) {
        const registerFee = fundResponseJson.params.register_fee[0];
        const amount = chainAmountToHuman(registerFee.amount, 6);
        setRegisterFee(ntrnPrice * Number(amount) * 2 + '');
      }
    })();
  }, [ntrnPrice]);

  const submit = async () => {
    const connectionId = lsdTokenChainConfig?.connectionId;
    if (!connectionId) {
      snackbarUtil.error('Connection ID not found');
      return;
    }

    dispatch(
      cosmosRegisterPool(connectionId, interChainAccountId, (success) => {
        if (success) {
          router.push({
            pathname: '/cosmos/[connectionId]/initPool',
            query: {
              ...router.query,
              connectionId: connectionId,
              interChainAccountId,
            },
          });
        }
      })
    );
  };

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto pb-[1rem]">
      <div className="flex justify-center mt-[.42rem]">
        <FormCard title="Register Pool">
          <>
            <InputItem
              label="Connection ID"
              value={lsdTokenChainConfig?.connectionId}
              placeholder="Connection ID"
              onChange={() => {}}
              disabled
              className="mt-[.33rem]"
            />

            <InputItem
              label="Interchain Account ID"
              placeholder="Unique string, max 16 characters, no - or ."
              value={interChainAccountId}
              onChange={(v) => {
                if (v.length > 16) {
                  return;
                }
                let res = v;
                res = res.replaceAll('.', '').replaceAll('-', '');
                setInterChainAccountId(res);
              }}
              className="mt-[.16rem]"
            />

            <InputItem
              label="Owner Address"
              placeholder="Neutron wallet address"
              value={neutronChainAccount?.bech32Address || ''}
              disabled
              onChange={() => {}}
              className="mt-[.16rem]"
            />

            <TipBar
              content={
                <div className="flex items-center">
                  Note: Pool registration has a
                  <span className="text-text1 ml-[0.04rem]">
                    non-refundable{' '}
                  </span>
                  <span className="mx-[.04rem]">
                    {registerFee ? (
                      <>
                        {formatNumber(registerFee, {
                          decimals: 2,
                          fixedDecimals: false,
                        })}
                        U
                      </>
                    ) : (
                      <DataLoading height=".14rem" width=".4rem" />
                    )}
                  </span>
                  fee.
                </div>
              }
              link="https://www.google.com"
              className="mt-[.36rem]"
            />

            <div className="flex justify-between mt-[.34rem] mb-[.36rem]">
              <CustomButton
                type="stroke"
                height=".56rem"
                width="2.62rem"
                onClick={() => router.back()}
              >
                Back
              </CustomButton>

              <CustomButton
                type="primary"
                height=".56rem"
                width="2.62rem"
                disabled={!interChainAccountId || !neutronChainAccount}
                onClick={submit}
                loading={cosmosEcoLoading}
              >
                Submit
              </CustomButton>
            </div>
          </>
        </FormCard>

        <FaqCard title="Parameter Tips" link="https://www.google.com">
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

export default RegisterPoolPage;
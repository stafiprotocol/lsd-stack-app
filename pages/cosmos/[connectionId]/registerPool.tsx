import { CustomButton } from 'components/common/CustomButton';
import { DataLoading } from 'components/common/DataLoading';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { getDocHost } from 'config/common';
import { lsdTokenConfigs, neutronChainConfig } from 'config/cosmos/chain';
import { COSMOS_CREATION_STEPS } from 'constants/common';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
import { usePrice } from 'hooks/usePrice';
import { LsdTokenConfig } from 'interfaces/common';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { cosmosRegisterPool } from 'redux/reducers/CosmosLsdSlice';
import { connectKeplrAccount } from 'redux/reducers/WalletSlice';
import { RootState } from 'redux/store';
import { chainAmountToHuman, formatNumber } from 'utils/numberUtils';
import snackbarUtil from 'utils/snackbarUtils';

export async function getStaticPaths() {
  const paths: any[] = [];
  lsdTokenConfigs.forEach((config) => {
    paths.push({ params: { connectionId: config.connectionId } });
  });

  return {
    paths,
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  return { props: {} };
};

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

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!neutronChainAccount) {
      return [false, 'Connect Wallet'];
    }
    if (!interChainAccountId) {
      return [true, 'Submit'];
    }
    return [false, 'Submit'];
  }, [interChainAccountId, neutronChainAccount]);

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
    if (!neutronChainAccount) {
      dispatch(connectKeplrAccount([neutronChainConfig]));
      return;
    }
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
      <div className="flex justify-center mt-[.42rem] items-start">
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
              placeholder="Unique string, max 16 characters"
              value={interChainAccountId}
              onChange={(v) => {
                if (v.length > 16) {
                  return;
                }
                let res = v;
                res = res
                  .replaceAll('.', '')
                  .replaceAll('-', '')
                  .replaceAll(' ', '');
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
              link={`${getDocHost()}/docs/develop_cosmos_lsd/deploy.html#pool-registration-fee `}
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
                disabled={buttonDisabled}
                onClick={submit}
                loading={cosmosEcoLoading}
              >
                {buttonText}
              </CustomButton>
            </div>
          </>
        </FormCard>

        <FaqCard
          title="Parameter Tips"
          link={`${getDocHost()}/docs/develop_cosmos_lsd/deploy.html#parameter-tips`}
        >
          <>
            Connection ID:
            <br />
            - Connection identifier of target chain and Neutron
            <br />
            <br />
            Interchain Account ID:
            <br />
            - An identifier of your pool
            <br />
            - Must be unique
            <br />
            - Max 16 characters
            <br />
            - Not contains Hyphen(-), Dot(.), blank space( )
            <br />
            <br />
            Owner Address:
            <br />- Adjust commission fee
            <br />- Adjust duration of era
            <br />- Manage validator set
            <br />- Pause or unpause pool
            <br />- Turn on or off LSM feature
          </>
        </FaqCard>
      </div>
    </div>
  );
};

export default RegisterPoolPage;

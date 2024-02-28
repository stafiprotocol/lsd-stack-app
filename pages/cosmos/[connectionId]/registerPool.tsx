import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { lsdTokenConfigs, neutronChainConfig } from 'config/cosmos/chain';
import { COSMOS_CREATION_STEPS } from 'constants/common';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
import { LsdTokenConfig } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { cosmosRegisterPool } from 'redux/reducers/CosmosLsdSlice';
import { RootState } from 'redux/store';
import snackbarUtil from 'utils/snackbarUtils';

const RegisterPoolPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [interChainAccountId, setInterChainAccountId] = useState('');
  const [lsdTokenChainConfig, setLsdTokenChainConfig] =
    useState<LsdTokenConfig>();

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

  const { cosmosEcoLoading } = useAppSelector((state: RootState) => {
    return {
      cosmosEcoLoading: state.cosmosLsd.cosmosEcoLoading,
    };
  });

  const neutronChainAccount = useCosmosChainAccount(neutronChainConfig.chainId);

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
              label="Pool Admin"
              placeholder="Neutron wallet address"
              value={neutronChainAccount?.bech32Address || ''}
              disabled
              onChange={() => {}}
              className="mt-[.16rem]"
            />

            <TipBar
              content={
                <div>
                  Note: Pool registration has a{' '}
                  <span className="text-text1">non-refundable 10U fee</span>.
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

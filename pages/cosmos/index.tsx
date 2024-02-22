import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { TipBar } from 'components/common/TipBar';
import { robotoBold } from 'config/font';
import { COSMOS_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { AppEco } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { setAppEco, setCreationStepInfo } from 'redux/reducers/AppSlice';

const CosmosPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAppEco(AppEco.Cosmos));
    dispatch(
      setCreationStepInfo({
        steps: COSMOS_CREATION_STEPS,
        activedIndex: 0,
      })
    );
  }, [dispatch]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="flex justify-center mt-[.42rem]">
        <FormCard title="Choose LSD Token">
          <>
            <TipBar
              content={
                'ATOM Liquid Staking utilizes Neutron infrastructure. Please acknowledge the inherent risks before proceeding.'
              }
              isWarning
              link=""
              className="mt-[.24rem]"
            />

            <div className="bg-[#DEE6F780] rounded-[.2rem] text-[.14rem] text-text1 flex justify-center items-center text-center mt-[.24rem] h-[.49rem]">
              ATOM
            </div>

            <div className="mt-[.57rem]">
              <CustomButton
                type="primary"
                height=".56rem"
                onClick={() => router.push('/cosmos/registerPool')}
              >
                Submit
              </CustomButton>
            </div>

            <div className="text-[.14rem] leading-[.21rem] text-[#6C86AD] mt-[.15rem] text-center">
              We currently only support ATOM. To deploy other LSD, please{' '}
              <a href="" target="_blank" className="underline">
                contact us
              </a>
            </div>
          </>
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

export default CosmosPage;

import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { useRouter } from 'next/router';

const RegisterPoolPage = () => {
  const router = useRouter();

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="flex justify-center mt-[.42rem]">
        <FormCard title="Register Pool">
          <>
            <InputItem
              label="Contact ID"
              value="9"
              placeholder="Contact ID"
              onChange={() => {}}
              disabled
              className="mt-[.33rem]"
            />

            <InputItem
              label="Interchain Account ID"
              placeholder="Unique string, max 16 characters, no underscores or periods"
              value=""
              onChange={() => {}}
              className="mt-[.16rem]"
            />

            <InputItem
              label="Pool Admin"
              placeholder="Example: 0x0000000000000000"
              value=""
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
              link=""
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
                onClick={() => router.push('/cosmos/initPool')}
              >
                Submit
              </CustomButton>
            </div>
          </>
        </FormCard>

        <FaqCard title="Parameter Tips" link="">
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

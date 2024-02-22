import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { useRouter } from 'next/router';
import { useState } from 'react';

const InitPoolPage = () => {
  const router = useRouter();

  const [voterParamsOpened, setVoterParamsOpened] = useState(false);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="flex justify-center mt-[.42rem]">
        {!voterParamsOpened ? (
          <FormCard title="Set Parameters">
            <>
              <InputItem
                label="Interchain Account ID"
                placeholder="Interchain Account ID"
                value="0x0000000000000000"
                onChange={() => {}}
                className="mt-[.32rem]"
              />

              <InputItem
                label="Fee Receiver"
                placeholder="Please enter the Neutron address for the fee recipient"
                value=""
                onChange={() => {}}
                className="mt-[.16rem]"
              />

              <InputItem
                label="Fee Commission"
                placeholder="Fee Commission"
                value=""
                onChange={() => {}}
                className="mt-[.16rem]"
              />

              <InputItem
                label="LSD Token Code ID"
                placeholder="LSD Token Code ID"
                value=""
                onChange={() => {}}
                className="mt-[.16rem]"
              />

              <InputItem
                label="LSD Token Name"
                placeholder="Example: StaFi rATOM"
                value=""
                onChange={() => {}}
                className="mt-[.16rem]"
              />

              <InputItem
                label="LSD Token Symbol"
                placeholder="Example: rATOM"
                value=""
                onChange={() => {}}
                className="mt-[.16rem]"
              />

              <InputItem
                label="Validator Addr Amount"
                placeholder="Validator Addr Amount"
                value=""
                onChange={() => {}}
                className="mt-[.16rem]"
              />

              <TipBar
                content={
                  <div>
                    Commission fee is set defaults as 10%, StaFi Stack Fee set
                    as 10%.
                  </div>
                }
                link=""
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

                <CustomButton type="primary" height=".56rem" width="2.62rem">
                  Submit
                </CustomButton>
              </div>
            </>
          </FormCard>
        ) : (
          <FormCard title="Validator Address">
            <>
              <InputItem
                label="Validator Addr Amount"
                value=""
                onChange={() => {}}
                placeholder=""
                disabled
                className="mt-[.33rem]"
              />

              <div className="mt-[.57rem]">
                <CustomButton type="stroke" height=".56rem" width="2.62rem">
                  Back
                </CustomButton>

                <CustomButton type="primary" height=".56rem" width="2.62rem">
                  Submit
                </CustomButton>
              </div>
            </>
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

export default InitPoolPage;

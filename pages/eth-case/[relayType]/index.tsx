import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { getDocHost } from 'config/common';
import { useAppDispatch } from 'hooks/common';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { setBackRoute } from 'redux/reducers/AppSlice';
import { demoCreateLsdNetworkStandard } from 'redux/reducers/LsdSlice';
import { validateAddress } from 'utils/web3Utils';

export function getStaticProps() {
  return { props: {} };
}

export function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          relayType: 'standard',
        },
      },
      {
        params: {
          relayType: 'customize',
        },
      },
    ],
    fallback: false,
  };
}

const ParameterPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [tokenName, setTokenName] = useState('StaFi rETH');
  const [symbol, setSymbol] = useState('rETH');
  const [ownerAddress, setOwnerAddress] = useState(
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  );
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [paramList, setParamList] = useState<ParamItem[]>([]);

  const [btnContent, setBtnContent] = useState<
    'Connect Wallet' | 'Switch Network' | 'Submit'
  >('Submit');
  const [submittable, setSubmittable] = useState(false);

  const submit = async () => {
    if (!submittable) return;
    setParamList([
      { name: 'Token Name', value: tokenName },
      { name: 'Symbol', value: symbol },
      { name: 'Owner Address', value: ownerAddress },
    ]);
    setConfirmModalOpened(true);
  };

  const create = () => {
    dispatch(
      demoCreateLsdNetworkStandard((success: boolean) => {
        if (success) {
          router.push('/eth-case/standard/review');
        }
      })
    );
  };

  useEffect(() => {
    setSubmittable(
      !!tokenName &&
        tokenName.length <= 50 &&
        !!symbol &&
        symbol.length <= 10 &&
        !!ownerAddress &&
        validateAddress(ownerAddress)
    );
  }, [tokenName, symbol, ownerAddress]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <div className="mt-[.36rem] flex ">
          <div className={classNames('flex-1 min-w-[6.2rem] w-[6.2rem]')}>
            <div className="bg-color-bg2 rounded-[.3rem] pb-[.14rem] border-[.01rem] border-color-border1">
              <div className="text-[.28rem] leading-[.42rem] font-[700] text-text1 text-center mt-[.24rem]">
                Set Parameters
              </div>

              <div className="w-[5.47rem] mx-auto mt-[.32rem] gap-[.16rem] flex flex-col">
                <InputItem
                  label="Token Name"
                  value={tokenName}
                  onChange={(v) => setTokenName(v)}
                  placeholder="Example: StaFi rETH"
                />
                {tokenName.length > 50 && (
                  <InputErrorTip msg="Token name must be less than 50 character" />
                )}
                <InputItem
                  label="Symbol"
                  value={symbol}
                  onChange={(v) => setSymbol(v)}
                  placeholder="Example: rETH"
                />
                {symbol.length > 10 && (
                  <InputErrorTip msg="Symbol must be less than 10 character" />
                )}
                <InputItem
                  label="Owner Address"
                  value={ownerAddress}
                  onChange={(v) => setOwnerAddress(v)}
                  placeholder="Example: 0x..."
                />
              </div>

              <div className="w-[5.47rem] mx-auto mt-[.24rem]">
                <TipBar
                  content="Commission fee is set defaults as 10%, StaFi Stack Fee set as 10%."
                  link={`${getDocHost()}/develop_eth_lsd/deploy/#rewards-distribution`}
                />
              </div>

              <div className="w-[5.47rem] mt-[.26rem] mx-auto flex justify-between">
                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  type="stroke"
                  onClick={() => {
                    dispatch(setBackRoute(''));
                    router.replace('/eth-case');
                  }}
                >
                  Back
                </CustomButton>
                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  disabled={!submittable}
                  onClick={submit}
                  type={'primary'}
                >
                  {btnContent}
                </CustomButton>
              </div>
            </div>
          </div>

          <FaqCard
            title="Parameter Tips"
            link={`${getDocHost()}/develop_eth_lsd/deploy/#parameter-tips`}
          >
            <>
              Owner Address: sets the owner of the LSD network being created.
              <br />
              Owner Permissions:
              <br />
              - Upgrade contracts
              <br />
              - Adjust commission fee
              <br />
              - Adjust duration of era
              <br />
              - Nominate voter manager
              <br />- Adjust other parameters
            </>
          </FaqCard>
        </div>
      </div>

      {confirmModalOpened && (
        <ConfirmModal
          open={confirmModalOpened}
          close={() => setConfirmModalOpened(false)}
          paramList={paramList}
          create={create}
        />
      )}
    </div>
  );
};

export default ParameterPage;

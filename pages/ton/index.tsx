import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { getDocHost } from 'config/common';
import { useAppDispatch } from 'hooks/common';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { setBackRoute, setCreationStepInfo } from 'redux/reducers/AppSlice';
import Image from 'next/image';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useTonClient } from 'hooks/ton/useTonClient';
import { sendNewStakePool } from 'redux/reducers/TonSlice';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { TON_CREATION_STEPS } from 'constants/common';

const TonPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [tonConnectUI, setOptions] = useTonConnectUI();
  const tonAddress = useTonAddress();

  const [btnContent, setBtnContent] = useState<
    'Connect Wallet' | 'Switch Network' | 'Submit'
  >('Connect Wallet');
  const [submittable, setSubmittable] = useState(false);

  // parameters
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');

  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [paramList, setParamList] = useState<ParamItem[]>([]);

  const tonClient = useTonClient();

  const btnType = useMemo(() => {
    // if (!displayAddress) {
    //   return 'secondary';
    // }
    return 'primary';
  }, []);

  const onBack = () => {
    // dispatch(setBackRoute('tokenStandard'));
    // router.replace('/');
    dispatch(setBackRoute(''));
    router.replace('/');
  };

  const submit = async () => {
    if (!tonAddress) {
      openWalletModal();
      return;
    }
    if (!tonClient) {
      return;
    }

    setParamList([
      { name: 'Token Name', value: tokenName },
      { name: 'Symbol', value: tokenSymbol },
      { name: 'Owner Address', value: tonAddress },
    ]);
    setConfirmModalOpened(true);
  };

  const openWalletModal = () => {
    tonConnectUI.openModal();
  };

  const create = () => {
    if (!tonClient) return;
    const cb = (success: boolean) => {
      if (success) {
        router.push(`/ton/review`);
      }
    };

    dispatch(
      sendNewStakePool(tonClient, tonConnectUI, tokenName, tokenSymbol, cb)
    );
  };

  useEffect(() => {
    if (tonAddress) {
      setBtnContent('Submit');
    } else {
      setBtnContent('Connect Wallet');
    }
  }, [tonAddress]);

  useEffect(() => {
    if (!tonAddress) {
      setSubmittable(true);
      return;
    }
    if (!tokenName || !tokenSymbol) {
      setSubmittable(false);
      return;
    }
    setSubmittable(true);
  }, [tonAddress, tokenName, tokenSymbol]);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: TON_CREATION_STEPS,
        activedIndex: 1,
      })
    );
  }, []);

  // useEffect(() => {
  //   if (!tonClient || !tonConnectUI || !tonConnectUI.account) return;
  //   parseBoc(tonClient, tonConnectUI.account.address);
  // }, [tonClient, tonConnectUI]);

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
                  placeholder="Example: StaFi rTON"
                />
                {tokenName.length > 50 && (
                  <InputErrorTip msg="Token name must be less than 50 character" />
                )}
                <InputItem
                  label="Symbol"
                  value={tokenSymbol}
                  onChange={(v) => setTokenSymbol(v)}
                  placeholder="Example: rTON"
                />
                {tokenSymbol.length > 10 && (
                  <InputErrorTip msg="Symbol must be less than 10 character" />
                )}
                <InputItem
                  label="Owner Address"
                  value={tonAddress}
                  onChange={() => {}}
                  disabled
                  placeholder="Owner Address"
                />
              </div>

              <div className="w-[5.47rem] mx-auto mt-[.24rem]">
                <TipBar
                  content="Commission fee is set defaults as 10%, StaFi Stack Fee set as 10%."
                  link={`${getDocHost()}/develop_ton_lsd/deploy/#rewards-distribution`}
                />
              </div>

              <div className="w-[5.47rem] mt-[.26rem] mx-auto flex justify-between">
                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  type="stroke"
                  onClick={onBack}
                >
                  Back
                </CustomButton>

                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  // loading={lrtTokenInWhiteListInfo.queryLoading}
                  disabled={!submittable}
                  onClick={submit}
                  type={btnType as 'primary'}
                >
                  {btnContent}
                </CustomButton>
              </div>
            </div>
          </div>

          <div className="ml-[.87rem] flex-1">
            <div className="flex items-center gap-[.12rem]">
              <a
                className="text-[.24rem] text-text1 leading-[.36rem] underline"
                href={`${getDocHost()}/develop_ton_lsd/deploy/#parameter-tips`}
                target="_blank"
              >
                Parameter Tips
              </a>
              <div className="relative w-[.12rem] h-[.12rem]">
                <Image src={ExternalLinkImg} alt="link" layout="fill" />
              </div>
            </div>

            <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2 max-h-[5.6rem] overflow-y-auto">
              Owner Address: sets the owner of the LSD network being created.
              <br />
              <br />
              Owner Permissions:
              <br />
              - Upgrade contracts
              <br />
              - Adjust commission fee
              <br />- Adjust the minimum stake amount
              <br />
            </div>
          </div>
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

export default TonPage;

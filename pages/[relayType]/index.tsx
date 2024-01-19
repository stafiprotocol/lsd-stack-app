import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { getEthereumChainId } from 'config/env';
import { useAppDispatch } from 'hooks/common';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useMemo, useState } from 'react';
import { setBackRoute } from 'redux/reducers/AppSlice';
import { createLsdNetworkStandard } from 'redux/reducers/LsdSlice';
import { connectMetaMask } from 'redux/reducers/WalletSlice';

const ParameterPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();

  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [paramList, setParamList] = useState<ParamItem[]>([]);

  const [submittable, btnContent] = useMemo(() => {
    if (!metaMaskAccount) return [true, 'Connect Wallet'];
    if (Number(metaMaskChainId) !== getEthereumChainId()) {
      return [true, 'Switch Network'];
    }
    return [!!tokenName && !!symbol && !!ownerAddress, 'Submit'];
  }, [tokenName, symbol, ownerAddress, metaMaskAccount, metaMaskChainId]);

  const submit = () => {
    if (!metaMaskAccount || Number(metaMaskChainId) !== getEthereumChainId()) {
      dispatch(connectMetaMask(getEthereumChainId()));
      return;
    }

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
      createLsdNetworkStandard(tokenName, symbol, ownerAddress, (success) => {
        if (success) {
          router.push('/standard/review');
        }
      })
    );
  };

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
                <InputItem
                  label="Symbol"
                  value={symbol}
                  onChange={(v) => setSymbol(v)}
                  placeholder="Example: rETH"
                />
                <InputItem
                  label="Owner Address"
                  value={ownerAddress}
                  onChange={(v) => setOwnerAddress(v)}
                  placeholder="control contract upgrades, parameter configuration"
                />
              </div>

              <div className="w-[5.47rem] mx-auto mt-[.24rem]">
                <TipBar
                  content="Commission fee is set defaults as 10%, StaFi Stack Fee set as 10%."
                  link="https://d835jsgd5asjf.cloudfront.net/docs/developethlsd/deploy.html#rewards-distribution"
                />
              </div>

              <div className="w-[5.47rem] mt-[.26rem] mx-auto flex justify-between">
                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  type="stroke"
                  onClick={() => {
                    dispatch(setBackRoute(''));
                    router.replace('/');
                  }}
                >
                  Back
                </CustomButton>
                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  disabled={!submittable}
                  onClick={submit}
                  type={
                    Number(metaMaskChainId) === getEthereumChainId()
                      ? 'primary'
                      : 'secondary'
                  }
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
                href="https://d835jsgd5asjf.cloudfront.net/docs/developethlsd/deploy.html#parameter-tips"
              >
                Parameter Tips
              </a>
              <div className="relative w-[.12rem] h-[.12rem]">
                <Image src={ExternalLinkImg} alt="link" layout="fill" />
              </div>
            </div>

            <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2">
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

export default ParameterPage;

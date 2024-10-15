import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { getDocHost } from 'config/common';
import { getFactoryContract } from 'config/eth/contract';
import { getEthereumChainId } from 'config/eth/env';
import { useAppDispatch } from 'hooks/common';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { setBackRoute } from 'redux/reducers/AppSlice';
import { createLsdNetworkStandard } from 'redux/reducers/LsdSlice';
import { getInjectedConnector } from 'utils/commonUtils';
import { validateAddress } from 'utils/web3Utils';
import { useConnect, useContractWrite, useSwitchNetwork } from 'wagmi';
import Web3 from 'web3';

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

  const { connectors, connectAsync } = useConnect();
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();
  const { switchNetwork } = useSwitchNetwork();

  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [paramList, setParamList] = useState<ParamItem[]>([]);

  const [btnContent, setBtnContent] = useState<
    'Connect Wallet' | 'Switch Network' | 'Submit'
  >('Connect Wallet');
  const [submittable, setSubmittable] = useState(false);

  const isOwnerAddressValid = useMemo(() => {
    return Web3.utils.isAddress(ownerAddress);
  }, [ownerAddress]);

  const btnType = useMemo(() => {
    if (metaMaskAccount && metaMaskChainId !== getEthereumChainId()) {
      return 'secondary';
    }
    return 'primary';
  }, [metaMaskAccount, metaMaskChainId]);

  const { writeAsync: standardWriteAsync } = useContractWrite({
    address: getFactoryContract().address,
    abi: getFactoryContract().abi,
    functionName: 'createLsdNetworkWithEntrustedVoters',
    args: [],
  });

  const submit = async () => {
    if (!metaMaskAccount) {
      const metamaskConnector = getInjectedConnector(connectors);
      if (!metamaskConnector) {
        return;
      }
      try {
        await connectAsync({
          chainId: getEthereumChainId(),
          connector: metamaskConnector,
        });
      } catch (err: any) {
        if (err.code === 4001) {
        } else {
          console.error(err);
        }
      }
      return;
    }
    if (Number(metaMaskChainId) !== getEthereumChainId()) {
      try {
        switchNetwork && switchNetwork(getEthereumChainId());
      } catch (err: any) {
        console.error(err);
      }
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
      createLsdNetworkStandard(
        standardWriteAsync,
        tokenName,
        symbol,
        ownerAddress,
        (success) => {
          if (success) {
            router.push('/eth/standard/review');
          }
        }
      )
    );
  };

  useEffect(() => {
    if (!metaMaskAccount) {
      setBtnContent('Connect Wallet');
    } else {
      if (metaMaskChainId !== getEthereumChainId()) {
        setBtnContent('Switch Network');
      } else {
        setBtnContent('Submit');
      }
    }
  }, [metaMaskAccount, metaMaskChainId]);

  useEffect(() => {
    if (!metaMaskChainId || metaMaskChainId !== getEthereumChainId()) {
      setSubmittable(true);
      return;
    }
    setSubmittable(
      !!tokenName &&
        tokenName.length <= 50 &&
        !!symbol &&
        symbol.length <= 10 &&
        !!ownerAddress &&
        validateAddress(ownerAddress)
    );
  }, [metaMaskAccount, metaMaskChainId, tokenName, symbol, ownerAddress]);

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
                {!!ownerAddress && !isOwnerAddressValid && (
                  <InputErrorTip msg="Owner address is invalid" />
                )}
              </div>

              <div className="w-[5.47rem] mx-auto mt-[.24rem]">
                <TipBar
                  content="Commission fee is set defaults as 10%, StaFi Stack Fee set as 10%."
                  link={`${getDocHost()}/developethlsd/deploy/#rewards-distribution`}
                />
              </div>

              <div className="w-[5.47rem] mt-[.26rem] mx-auto flex justify-between">
                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  type="stroke"
                  onClick={() => {
                    dispatch(setBackRoute(''));
                    router.replace('/eth');
                  }}
                >
                  Back
                </CustomButton>
                <CustomButton
                  width="2.62rem"
                  height=".56rem"
                  disabled={!submittable}
                  onClick={submit}
                  type={btnType}
                >
                  {btnContent}
                </CustomButton>
              </div>
            </div>
          </div>

          <FaqCard
            title="Parameter Tips"
            link={`${getDocHost()}/developethlsd/deploy/#parameter-tips`}
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

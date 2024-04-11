import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { getDocHost } from 'config/common';
import { getEthereumChainId } from 'config/eth/env';
import { getLrtFactoryContract } from 'config/lrt/contract';
import { LRT_CREATION_STEPS } from 'constants/common';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect, useMemo, useState } from 'react';
import { setBackRoute, setCreationStepInfo } from 'redux/reducers/AppSlice';
import {
  createLrtNetworkCustom,
  createLrtNetworkStandard,
  queryLrdTokenInWhiteList,
  setLrtTokenInWhiteListInfo,
} from 'redux/reducers/LrtSlice';
import { validateAddress } from 'utils/web3Utils';
import {
  useAccount,
  useConnect,
  useContractWrite,
  useNetwork,
  useSwitchNetwork,
} from 'wagmi';
import Web3 from 'web3';

export function getStaticProps() {
  return { props: {} };
}

export function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          tokenType: 'customize',
        },
      },
      {
        params: {
          tokenType: 'standard',
        },
      },
    ],
    fallback: false,
  };
}

const ParameterPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { lrtTokenInWhiteListInfo } = useAppSelector((state) => state.lrt);
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();
  const { connectors, connectAsync } = useConnect();
  const { switchNetwork } = useSwitchNetwork();

  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [operatorAddress, setOperatorAddress] = useState('');
  const [lrtTokenAddress, setLrtTokenAddress] = useState('');
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [paramList, setParamList] = useState<ParamItem[]>([]);

  const [btnContent, setBtnContent] = useState<
    'Connect Wallet' | 'Switch Network' | 'Submit'
  >('Connect Wallet');
  const [submittable, setSubmittable] = useState(false);

  const tokenType = useMemo(() => {
    return router.query.tokenType;
  }, [router]);

  const isOwnerAddressValid = useMemo(() => {
    return Web3.utils.isAddress(ownerAddress);
  }, [ownerAddress]);

  const isOperatorAddressValid = useMemo(() => {
    return Web3.utils.isAddress(operatorAddress);
  }, [operatorAddress]);

  const btnType = useMemo(() => {
    if (metaMaskAccount && metaMaskChainId !== getEthereumChainId()) {
      return 'secondary';
    }
    return 'primary';
  }, [metaMaskAccount, metaMaskChainId]);

  const { writeAsync: standardWriteAsync } = useContractWrite({
    address: getLrtFactoryContract().address,
    abi: getLrtFactoryContract().abi,
    functionName: 'createLrdNetwork',
    args: [],
  });

  const { writeAsync: customWriteAsync } = useContractWrite({
    address: getLrtFactoryContract().address,
    abi: getLrtFactoryContract().abi,
    functionName: 'createLrdNetworkWithLrdToken',
    args: [],
  });

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: LRT_CREATION_STEPS,
        activedIndex: 2,
      })
    );
  }, [dispatch]);

  const submit = async () => {
    if (!metaMaskAccount) {
      const metamaskConnector = connectors.find((c) => c.name === 'MetaMask');
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
    if (metaMaskChainId !== getEthereumChainId()) {
      try {
        switchNetwork && switchNetwork(getEthereumChainId());
      } catch (err: any) {
        console.error(err);
      }
      return;
    }

    if (!submittable) return;
    if (tokenType === 'standard') {
      setParamList([
        { name: 'Token Name', value: tokenName },
        { name: 'Symbol', value: symbol },
        { name: 'Owner Address', value: ownerAddress },
        { name: 'Operator Address', value: operatorAddress },
      ]);
    } else {
      setParamList([
        { name: 'LRT Address', value: lrtTokenAddress },
        { name: 'Owner Address', value: ownerAddress },
        { name: 'Operator Address', value: operatorAddress },
      ]);
    }
    setConfirmModalOpened(true);
  };

  const onBack = () => {
    // dispatch(setBackRoute('tokenStandard'));
    // router.replace('/');
    dispatch(setBackRoute(''));
    router.replace('/lrt');
  };

  const create = () => {
    const cb = (success: boolean) => {
      if (success) {
        router.push(`/lrt/${tokenType}/review`);
      }
    };
    if (tokenType === 'standard') {
      dispatch(
        createLrtNetworkStandard(
          standardWriteAsync,
          tokenName,
          symbol,
          ownerAddress,
          operatorAddress,
          cb
        )
      );
    } else {
      dispatch(
        createLrtNetworkCustom(
          customWriteAsync,
          lrtTokenAddress,
          ownerAddress,
          operatorAddress,
          cb
        )
      );
    }
  };

  useEffect(() => {
    dispatch(
      setLrtTokenInWhiteListInfo({
        inWhiteList: true,
        queryLoading: false,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!!lrtTokenAddress) {
      dispatch(queryLrdTokenInWhiteList(lrtTokenAddress));
    }
  }, [dispatch, lrtTokenAddress]);

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
    if (!metaMaskAccount || metaMaskChainId !== getEthereumChainId()) {
      setSubmittable(true);
      return;
    }
    if (tokenType === 'customize' && !lrtTokenInWhiteListInfo.inWhiteList) {
      setSubmittable(false);
    }
    if (tokenType === 'standard') {
      setSubmittable(
        !!tokenName &&
          tokenName.length <= 50 &&
          !!symbol &&
          symbol.length <= 10 &&
          !!ownerAddress &&
          validateAddress(ownerAddress) &&
          !!operatorAddress &&
          validateAddress(operatorAddress)
      );
    } else {
      setSubmittable(
        !!lrtTokenAddress &&
          lrtTokenInWhiteListInfo.inWhiteList &&
          !!ownerAddress &&
          validateAddress(ownerAddress) &&
          !!operatorAddress &&
          validateAddress(operatorAddress)
      );
    }
  }, [
    metaMaskChainId,
    metaMaskAccount,
    tokenName,
    symbol,
    ownerAddress,
    tokenType,
    lrtTokenAddress,
    operatorAddress,
    lrtTokenInWhiteListInfo,
  ]);

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
                {tokenType === 'standard' && (
                  <>
                    <InputItem
                      label="Token Name"
                      value={tokenName}
                      onChange={(v) => setTokenName(v)}
                      placeholder="Example: StaFi rstETH"
                    />
                    {tokenName.length > 50 && (
                      <InputErrorTip msg="Token name must be less than 50 character" />
                    )}
                    <InputItem
                      label="Symbol"
                      value={symbol}
                      onChange={(v) => setSymbol(v)}
                      placeholder="Example: rstETH"
                    />
                    {symbol.length > 10 && (
                      <InputErrorTip msg="Symbol must be less than 10 character" />
                    )}
                  </>
                )}

                {tokenType === 'customize' && (
                  <>
                    <InputItem
                      label="LRT Address"
                      value={lrtTokenAddress}
                      onChange={(v) => setLrtTokenAddress(v)}
                      placeholder="LRT Address"
                    />
                    {!lrtTokenInWhiteListInfo.inWhiteList && (
                      <InputErrorTip msg="Please contact StaFi stack team to whitelist your LRT token contract" />
                    )}
                  </>
                )}

                <InputItem
                  label="Owner Address"
                  value={ownerAddress}
                  onChange={(v) => setOwnerAddress(v)}
                  placeholder="control contract upgrades, parameter configuration"
                />
                {!!ownerAddress && !isOwnerAddressValid && (
                  <InputErrorTip msg="Owner address is invalid" />
                )}

                <InputItem
                  label="Operator Address"
                  value={operatorAddress}
                  onChange={(v) => setOperatorAddress(v)}
                  placeholder="operator address"
                />
                {!!operatorAddress && !isOperatorAddressValid && (
                  <InputErrorTip msg="Operator address is invalid" />
                )}
              </div>

              <div className="w-[5.47rem] mx-auto mt-[.24rem]">
                <TipBar
                  content="Commission fee is set defaults as 10%, StaFi Stack Fee set as 10%."
                  link={`${getDocHost()}/docs/developlrt/deploy.html#rewards-distribution`}
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
                  disabled={!submittable}
                  loading={lrtTokenInWhiteListInfo.queryLoading}
                  onClick={submit}
                  type={btnType}
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
                href={`${getDocHost()}/docs/developlrt/deploy.html#parameter-tips`}
                target="_blank"
              >
                Parameter Tips
              </a>
              <div className="relative w-[.12rem] h-[.12rem]">
                <Image src={ExternalLinkImg} alt="link" layout="fill" />
              </div>
            </div>

            <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2 max-h-[5.6rem] overflow-y-auto">
              Owner Address: sets the owner of the LRT network being created.
              <br />
              <br />
              Owner Permissions:
              <br />
              - Upgrade contracts
              <br />
              - Adjust commission fee
              <br />
              - Adjust duration of era
              <br />
              - Manage supported LSTs 
              <br />
              <br />
              Operator Address: must be registered operator on EigenLayer
              <br />
              - <a
                href={getEthereumChainId() === 1 ? 'https://app.eigenlayer.xyz/operator' : 'https://holesky.eigenlayer.xyz/operator'}
                target='_blank'
              >
                Go and find operators
              </a>
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

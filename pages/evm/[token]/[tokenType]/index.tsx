import { checkAddress } from '@stafihub/apps-wallet';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { getDocHost } from 'config/common';
import { evmLsdTokens, getEvmFactoryAbi } from 'config/evm';
import { EVM_CREATION_STEPS } from 'constants/common';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect, useMemo, useState } from 'react';
import { setBackRoute, setCreationStepInfo } from 'redux/reducers/AppSlice';
import {
  createEvmLsdNetworkCustomCustom,
  createEvmLsdNetworkCustomStandard,
  queryEvmLsdTokenInWhiteList,
  setEvmLsdTokenInWhiteListInfo,
} from 'redux/reducers/EvmLsdSlice';
import snackbarUtil from 'utils/snackbarUtils';
import { validateAddress } from 'utils/web3Utils';
import { useConnect, useContractWrite, useSwitchNetwork } from 'wagmi';
import Web3 from 'web3';

export function getStaticProps() {
  return { props: {} };
}

export function getStaticPaths() {
  const paths: any[] = [];
  evmLsdTokens.forEach((token) => {
    paths.push({
      params: {
        token: token.symbol,
        tokenType: 'customize',
      },
    });
    paths.push({
      params: {
        token: token.symbol,
        tokenType: 'standard',
      },
    });
  });

  return {
    paths: paths,
    fallback: false,
  };
}

const ParameterPage = () => {
  const router = useRouter();
  const { token } = router.query;

  const lsdTokenConfig = useMemo(() => {
    const matchedLsdToken = evmLsdTokens.find((item) => item.symbol === token);
    return matchedLsdToken || evmLsdTokens[0];
  }, [token]);

  const dispatch = useAppDispatch();
  const { lsdTokenInWhiteListInfo } = useAppSelector((state) => state.evmLsd);

  const { connectors, connectAsync } = useConnect();
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();
  const { switchNetwork } = useSwitchNetwork();

  const [voterParamsOpened, setVoterParamsOpened] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [lsdTokenAddress, setLsdTokenAddress] = useState('');
  const [voteNumber, setVoteNumber] = useState('');
  const [votersAddrs, setVotersAddrs] = useState<string[]>([]);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [paramList, setParamList] = useState<ParamItem[]>([]);

  const [btnContent, setBtnContent] = useState<
    'Connect Wallet' | 'Switch Network' | 'Next' | 'Submit'
  >('Connect Wallet');
  const [submittable, setSubmittable] = useState(false);

  const tokenType = useMemo(() => {
    return router.query.tokenType;
  }, [router]);

  const isOwnerAddressValid = useMemo(() => {
    return Web3.utils.isAddress(ownerAddress);
  }, [ownerAddress]);

  const btnType = useMemo(() => {
    if (metaMaskAccount && metaMaskChainId !== lsdTokenConfig.chainId) {
      return 'secondary';
    }
    return 'primary';
  }, [metaMaskAccount, metaMaskChainId, lsdTokenConfig.chainId]);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: EVM_CREATION_STEPS,
        activedIndex: 3,
      })
    );
  }, [dispatch]);

  const changeVotersAddrs = (addr: string, index: number) => {
    setVotersAddrs((prev) => {
      const list = [...prev];
      list[index] = addr;
      return list;
    });
  };

  const { writeAsync: customStandardWriteAsync } = useContractWrite({
    address: lsdTokenConfig.factoryContract as `0x${string}`,
    abi: getEvmFactoryAbi(),
    functionName: 'createLsdNetwork',
    args: [],
  });

  const { writeAsync: customCustomWriteAsync } = useContractWrite({
    address: lsdTokenConfig.factoryContract as `0x${string}`,
    abi: getEvmFactoryAbi(),
    functionName: 'createLsdNetworkWithLsdToken',
    args: [],
  });

  const submit = async () => {
    if (!metaMaskAccount) {
      const metamaskConnector = connectors.find((c) => c.name === 'MetaMask');
      if (!metamaskConnector) {
        return;
      }
      try {
        await connectAsync({
          chainId: lsdTokenConfig.chainId,
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
    if (metaMaskChainId !== lsdTokenConfig.chainId) {
      try {
        switchNetwork && switchNetwork(lsdTokenConfig.chainId);
      } catch (err: any) {
        console.error(err);
      }
      return;
    }

    if (!submittable) return;
    if (!voterParamsOpened) {
      const list = [];
      for (let i = 0; i < Number(voteNumber); i++) {
        list.push('');
      }
      setVotersAddrs(list);
      setVoterParamsOpened(true);
    } else {
      const votersAddrsSet = new Set(votersAddrs);
      if (votersAddrsSet.size !== votersAddrs.length) {
        snackbarUtil.error('Voters addresses must be different');
        return;
      }
      if (tokenType === 'standard') {
        setParamList(
          [
            { name: 'Token Name', value: tokenName },
            { name: 'Symbol', value: symbol },
            { name: 'Owner Address', value: ownerAddress },
            { name: 'Voter Number', value: voteNumber },
          ].concat(
            votersAddrs.map((addr, index) => ({
              name: `Voter ${index + 1} Addr`,
              value: addr,
            }))
          )
        );
      } else {
        setParamList(
          [
            { name: 'LSD Token Address', value: lsdTokenAddress },
            { name: 'Owner Address', value: ownerAddress },
            { name: 'Voter Number', value: voteNumber },
          ].concat(
            votersAddrs.map((addr, index) => ({
              name: `Voter ${index + 1} Addr`,
              value: addr,
            }))
          )
        );
      }
      setConfirmModalOpened(true);
    }
  };

  const onBack = () => {
    if (voterParamsOpened) {
      setVoterParamsOpened(false);
    } else {
      // dispatch(setBackRoute('tokenStandard'));
      // router.replace('/');
      dispatch(setBackRoute(''));
      router.replace('/evm');
    }
  };

  const create = () => {
    const cb = (success: boolean) => {
      if (success) {
        router.push(`/evm/${token}/${tokenType}/review`);
      }
    };
    if (tokenType === 'standard') {
      console.log('createEvmLsdNetworkCustomStandard');
      dispatch(
        createEvmLsdNetworkCustomStandard(
          customStandardWriteAsync,
          lsdTokenConfig,
          tokenName,
          symbol,
          ownerAddress,
          votersAddrs,
          cb
        )
      );
    } else {
      dispatch(
        createEvmLsdNetworkCustomCustom(
          customCustomWriteAsync,
          lsdTokenConfig,
          lsdTokenAddress,
          ownerAddress,
          votersAddrs,
          cb
        )
      );
    }
  };

  useEffect(() => {
    dispatch(
      setEvmLsdTokenInWhiteListInfo({
        inWhiteList: true,
        queryLoading: false,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!!lsdTokenAddress) {
      dispatch(queryEvmLsdTokenInWhiteList(lsdTokenConfig, lsdTokenAddress));
    }
  }, [dispatch, lsdTokenAddress, lsdTokenConfig]);

  useEffect(() => {
    if (!metaMaskAccount) {
      setBtnContent('Connect Wallet');
    } else {
      if (metaMaskChainId !== lsdTokenConfig.chainId) {
        setBtnContent('Switch Network');
      } else if (!voterParamsOpened) {
        setBtnContent('Next');
      } else {
        setBtnContent('Submit');
      }
    }
  }, [
    metaMaskAccount,
    metaMaskChainId,
    lsdTokenConfig.chainId,
    voterParamsOpened,
  ]);

  useEffect(() => {
    if (!metaMaskAccount || metaMaskChainId !== lsdTokenConfig.chainId) {
      setSubmittable(true);
      return;
    }
    if (tokenType === 'customize' && !lsdTokenInWhiteListInfo.inWhiteList) {
      setSubmittable(false);
    }
    if (!voterParamsOpened) {
      if (tokenType === 'standard') {
        setSubmittable(
          !!tokenName &&
            tokenName.length <= 50 &&
            !!symbol &&
            symbol.length <= 10 &&
            !!ownerAddress &&
            validateAddress(ownerAddress) &&
            !!voteNumber &&
            Number(voteNumber) > 0
        );
      } else {
        setSubmittable(
          !!lsdTokenAddress &&
            lsdTokenInWhiteListInfo.inWhiteList &&
            !!ownerAddress &&
            validateAddress(ownerAddress) &&
            !!voteNumber &&
            Number(voteNumber) > 0
        );
      }
    } else {
      for (let addr of votersAddrs) {
        if (!addr || !checkAddress(addr, 'seivaloper')) {
          setSubmittable(false);
          return;
        }
      }
      setSubmittable(true);
    }
  }, [
    metaMaskChainId,
    metaMaskAccount,
    tokenName,
    symbol,
    ownerAddress,
    tokenType,
    voterParamsOpened,
    voteNumber,
    lsdTokenAddress,
    votersAddrs,
    lsdTokenInWhiteListInfo.inWhiteList,
    lsdTokenConfig.chainId,
  ]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto pb-[1rem]">
      <div className="my-[.36rem] mr-[.56rem]">
        <div className="mt-[.36rem] flex ">
          <div className={classNames('flex-1 min-w-[6.2rem] w-[6.2rem]')}>
            <div className="bg-color-bg2 rounded-[.3rem] pb-[.14rem] border-[.01rem] border-color-border1">
              <div className="text-[.28rem] leading-[.42rem] font-[700] text-text1 text-center mt-[.24rem]">
                {voterParamsOpened ? 'Validator Address' : 'Set Parameters'}
              </div>

              {!voterParamsOpened ? (
                <div className="w-[5.47rem] mx-auto mt-[.32rem] gap-[.16rem] flex flex-col">
                  {tokenType === 'standard' && (
                    <>
                      <InputItem
                        label="Token Name"
                        value={tokenName}
                        onChange={(v) => setTokenName(v)}
                        placeholder={`Example: StaFi r${lsdTokenConfig.symbol}`}
                      />
                      {tokenName.length > 50 && (
                        <InputErrorTip msg="Token name must be less than 50 character" />
                      )}
                      <InputItem
                        label="Symbol"
                        value={symbol}
                        onChange={(v) => setSymbol(v)}
                        placeholder={`Example: r${lsdTokenConfig.symbol}`}
                      />
                      {symbol.length > 10 && (
                        <InputErrorTip msg="Symbol must be less than 10 character" />
                      )}
                    </>
                  )}

                  {tokenType === 'customize' && (
                    <>
                      <InputItem
                        label="LSD Token Address"
                        value={lsdTokenAddress}
                        onChange={(v) => setLsdTokenAddress(v)}
                        placeholder="LSD Token Address"
                      />
                      {!lsdTokenInWhiteListInfo.inWhiteList && (
                        <InputErrorTip msg="Please contact StaFi stack team to whitelist your LSD token contract" />
                      )}
                    </>
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

                  <InputItem
                    isNumber
                    label="Validator Number"
                    value={voteNumber}
                    onChange={(v) => setVoteNumber(v)}
                    placeholder="Suggest to set more than 1"
                  />
                  {voteNumber !== '' && Number(voteNumber) === 0 && (
                    <InputErrorTip msg="Vote number must be greater than 0" />
                  )}
                </div>
              ) : (
                <div className="px-[.26rem] mx-auto mt-[.32rem] gap-[.16rem] flex flex-col max-h-[3.6rem] overflow-y-auto">
                  <InputItem
                    disabled
                    label="Validator Number"
                    value={voteNumber}
                    onChange={() => {}}
                    placeholder="Suggest to set more than 1"
                  />

                  {votersAddrs.map((item, index) => (
                    <div key={index} className="flex flex-col gap-[.16rem]">
                      <InputItem
                        label={`Validator ${index + 1} Addr`}
                        value={item}
                        onChange={(v) => changeVotersAddrs(v, index)}
                        placeholder={
                          lsdTokenConfig.symbol === 'SEI'
                            ? 'Example: seivaloper...'
                            : 'Example: 0x0000000000000000'
                        }
                      />
                      {!!item && !checkAddress(item, 'seivaloper') && (
                        <div className="pl-[.2rem]">
                          <InputErrorTip msg="Validator address is invalid" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="w-[5.47rem] mx-auto mt-[.24rem]">
                <TipBar
                  content="Commission fee is set defaults as 10%, StaFi Stack Fee set as 10%."
                  link={`${getDocHost()}/docs/develop_evm_lsd/deploy.html#rewards-distribution`}
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
                  loading={lsdTokenInWhiteListInfo.queryLoading}
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
                href={`${getDocHost()}/docs/develop_evm_lsd/deploy.html#parameter-tips`}
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
              <br />
              - Adjust duration of era
              <br />
              - Adjust parameters
              <br />
              <br />
              Validator Number:
              <br />
              - How many validators you intend to set
              <br />
              - Highly recommend to set more than 1
              <br />
              - The more validators you set the more decentralized advantages
              the network gets
              <br />-{' '}
              <a
                href={lsdTokenConfig.validatorExplorerUrl}
                target="_blank"
                className="underline text-color-link"
              >
                Browse all active validators
              </a>
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

export default ParameterPage;

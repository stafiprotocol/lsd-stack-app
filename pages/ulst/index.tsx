import { checkAddress } from '@stafihub/apps-wallet';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { getDocHost } from 'config/common';
import { evmLsdTokens, getEvmFactoryAbi, getStakeHubAbi } from 'config/evm';
import { robotoBold } from 'config/font';
import { getUlstFactoryAbi, ulstConfig } from 'config/ulst';
import {
  EVM_CREATION_STEPS,
  StakeHubContractAddress,
  ULST_CREATION_STEPS,
} from 'constants/common';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { setBackRoute, setCreationStepInfo } from 'redux/reducers/AppSlice';
import {
  createEvmLsdNetworkCustomCustom,
  createEvmLsdNetworkCustomStandard,
  queryEvmLsdTokenInWhiteList,
  setEvmLsdTokenInWhiteListInfo,
} from 'redux/reducers/EvmLsdSlice';
import { createUlstLsdNetwork } from 'redux/reducers/UlstSlice';
import { getInjectedConnector } from 'utils/commonUtils';
import snackbarUtil from 'utils/snackbarUtils';
import { getWeb3, validateAddress } from 'utils/web3Utils';
import { useConnect, useContractWrite, useSwitchNetwork } from 'wagmi';
import Web3 from 'web3';
import { isAddress, toBN } from 'web3-utils';

const ParameterPage = () => {
  const router = useRouter();
  const { token } = router.query;

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
  const [bnbValidatorIsValidMap, setBnbValidatorIsValidMap] = useState<{
    [key in string]?: boolean;
  }>({});

  const tokenType = useMemo(() => {
    return router.query.tokenType;
  }, [router]);

  const isOwnerAddressValid = useMemo(() => {
    return Web3.utils.isAddress(ownerAddress);
  }, [ownerAddress]);

  const btnType = useMemo(() => {
    if (metaMaskAccount && metaMaskChainId !== ulstConfig.chainId) {
      return 'secondary';
    }
    return 'primary';
  }, [metaMaskAccount, metaMaskChainId, ulstConfig.chainId]);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: ULST_CREATION_STEPS,
        activedIndex: 1,
      })
    );
  }, [dispatch]);

  const { writeAsync: customCustomWriteAsync } = useContractWrite({
    address: ulstConfig.factoryContract as `0x${string}`,
    abi: getUlstFactoryAbi(),
    functionName: 'createLsdNetwork',
    args: [],
    chainId: ulstConfig.chainId,
  });

  const submit = async () => {
    if (!metaMaskAccount) {
      const metamaskConnector = getInjectedConnector(connectors);
      if (!metamaskConnector) {
        return;
      }
      try {
        await connectAsync({
          chainId: ulstConfig.chainId,
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
    if (metaMaskChainId !== ulstConfig.chainId) {
      try {
        switchNetwork && switchNetwork(ulstConfig.chainId);
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
      {
        name: 'Stable Coins',
        value: ulstConfig.stableCoins.map((c) => c.name).join(', '),
      },
    ]);
    setConfirmModalOpened(true);
  };

  const onBack = () => {
    dispatch(setBackRoute(''));
    router.replace('/');
  };

  const create = () => {
    const cb = (success: boolean) => {
      if (success) {
        router.push(`/ulst/review`);
      }
    };
    dispatch(
      createUlstLsdNetwork(customCustomWriteAsync, tokenName, symbol, cb)
    );
  };

  useEffect(() => {
    if (!metaMaskAccount) {
      setBtnContent('Connect Wallet');
      setOwnerAddress('');
    } else {
      setOwnerAddress(metaMaskAccount);
      if (metaMaskChainId !== ulstConfig.chainId) {
        setBtnContent('Switch Network');
      } else {
        setBtnContent('Submit');
      }
    }
  }, [metaMaskAccount, metaMaskChainId, ulstConfig.chainId]);

  useEffect(() => {
    if (!metaMaskAccount || metaMaskChainId !== ulstConfig.chainId) {
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
  }, [
    metaMaskChainId,
    metaMaskAccount,
    tokenName,
    symbol,
    ownerAddress,
    ulstConfig.chainId,
  ]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto pb-[1rem]">
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
                  placeholder={`Example: StaFi r${ulstConfig.symbol}`}
                />
                {tokenName.length > 50 && (
                  <InputErrorTip msg="Token name must be less than 50 character" />
                )}
                <InputItem
                  label="Symbol"
                  value={symbol}
                  onChange={(v) => setSymbol(v)}
                  placeholder={`Example: r${ulstConfig.symbol}`}
                />
                {symbol.length > 10 && (
                  <InputErrorTip msg="Symbol must be less than 10 character" />
                )}

                <InputItem
                  label="Owner Address"
                  value={ownerAddress}
                  onChange={(_) => {}}
                  placeholder="Example: 0x..."
                  disabled
                />
                {!!ownerAddress && !isOwnerAddressValid && (
                  <InputErrorTip msg="Owner address is invalid" />
                )}

                <InputItem
                  label="Stable Coins"
                  value={ulstConfig.stableCoins.map((s) => s.name).join(', ')}
                  onChange={(_) => {}}
                  placeholder=""
                  disabled
                />
              </div>

              <div className="w-[5.47rem] mx-auto mt-[.24rem]">
                <TipBar
                  content="Commission fee is set defaults as 10%, StaFi Stack Fee set as 10%."
                  link={`${getDocHost()}/develop_ulst/deploy/#rewards-distribution`}
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
                href={`${getDocHost()}/develop_ulst/deploy/#parameter-tips`}
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

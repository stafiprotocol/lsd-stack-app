import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { getDocHost } from 'config/common';
import { getEthereumChainId } from 'config/eth/env';
import { getLrtFactoryContract } from 'config/lrt/contract';
import { solanaDevConfig, solanaProdConfig } from 'config/sol';
import { SOL_CREATION_STEPS } from 'constants/common';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect, useMemo, useState } from 'react';
import { setBackRoute, setCreationStepInfo } from 'redux/reducers/AppSlice';
import {
  setLrtOperatorValidInfo,
  setLrtTokenInWhiteListInfo,
} from 'redux/reducers/LrtSlice';
import { solanaInitializeStakeManager } from 'redux/reducers/SolSlice';
import { RootState } from 'redux/store';
import { validateSolanaAddress } from 'utils/address';
import { chainAmountToHuman } from 'utils/numberUtils';
import { useContractWrite } from 'wagmi';

const ParameterPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { lrtTokenInWhiteListInfo } = useAppSelector((state) => state.lrt);
  const lrtOperatorValidInfo = useAppSelector(
    (state: RootState) => state.lrt.lrtOperatorValidInfo
  );
  const walletModal = useWalletModal();
  const { connection } = useConnection();
  const { publicKey: userPublicKey, sendTransaction, wallet } = useWallet();
  const displayAddress = userPublicKey?.toString();

  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [validatorAddress, setValidatorAddress] = useState('');
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [paramList, setParamList] = useState<ParamItem[]>([]);
  const [solBalance, setSolBalance] = useState<string>();

  const [btnContent, setBtnContent] = useState<
    'Connect Wallet' | 'Switch Network' | 'Submit'
  >('Connect Wallet');
  const [submittable, setSubmittable] = useState(false);

  const isSolMainnet =
    router.pathname.startsWith('/sol') && router.query.net === 'mainnet';

  useEffect(() => {
    (async () => {
      try {
        // const connection = new Connection(getSolanaRestRpc(), {
        //   wsEndpoint: getSolanaWsRpc(),
        //   commitment: SOLANA_COMMITMENT,
        // });
        if (!userPublicKey) {
          return;
        }

        const balance = await connection.getBalance(userPublicKey);
        let solBalance = chainAmountToHuman(balance, 9);
        // console.log({ solBalance });
        setSolBalance(balance ? solBalance : '0');
      } catch (err) {
        // dispatch(setSolanaBalance('--'));
        setSolBalance(undefined);
      }
    })();
  }, [userPublicKey, connection]);

  const isValidatorAddressInvalid = useMemo(() => {
    return !!validatorAddress && !validateSolanaAddress(validatorAddress);
  }, [validatorAddress]);

  const btnType = useMemo(() => {
    if (!displayAddress) {
      return 'secondary';
    }
    return 'primary';
  }, [displayAddress]);

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
        steps: SOL_CREATION_STEPS,
        activedIndex: 1,
      })
    );
  }, [dispatch]);

  const submit = async () => {
    if (!displayAddress) {
      walletModal.setVisible(true);
      return;
    }

    if (!submittable) return;
    setParamList([
      { name: 'Owner Address', value: displayAddress },
      { name: 'Validator Address', value: validatorAddress },
    ]);
    setConfirmModalOpened(true);
  };

  const onBack = () => {
    // dispatch(setBackRoute('tokenStandard'));
    // router.replace('/');
    dispatch(setBackRoute(''));
    router.replace('/');
  };

  const create = async () => {
    if (!userPublicKey) {
      return;
    }

    const solanaPrograms = isSolMainnet
      ? solanaProdConfig.programs
      : solanaDevConfig.programs;

    setConfirmModalOpened(false);

    dispatch(
      solanaInitializeStakeManager(
        userPublicKey,
        new PublicKey(validatorAddress),
        connection,
        solanaPrograms,
        (stakeManagerAddress) => {
          router.push(`/sol/review?stakeManagerAddress=${stakeManagerAddress}`);
        }
      )
    );
  };

  useEffect(() => {
    dispatch(
      setLrtTokenInWhiteListInfo({
        inWhiteList: true,
        queryLoading: false,
      })
    );
    dispatch(
      setLrtOperatorValidInfo({
        isValid: true,
        queryLoading: false,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!displayAddress) {
      setBtnContent('Connect Wallet');
    } else {
      setBtnContent('Submit');
    }
  }, [displayAddress]);

  useEffect(() => {
    if (!displayAddress) {
      setSubmittable(true);
      return;
    }
    if (!validatorAddress || isValidatorAddressInvalid) {
      setSubmittable(false);
      return;
    }
    setSubmittable(true);
  }, [
    lrtTokenInWhiteListInfo,
    displayAddress,
    validatorAddress,
    isValidatorAddressInvalid,
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
                <InputItem
                  label="Owner Address"
                  value={displayAddress}
                  onChange={() => {}}
                  disabled
                  placeholder="Example: HEL..."
                />

                {/* <InputItem
                  label="Token Name"
                  value={tokenName}
                  onChange={(v) => setTokenName(v)}
                  placeholder="Example: StaFi rSOL"
                />
                {tokenName.length > 50 && (
                  <InputErrorTip msg="Token name must be less than 50 character" />
                )}

                <InputItem
                  label="Symbol"
                  value={symbol}
                  onChange={(v) => setSymbol(v)}
                  placeholder="Example: rSOL"
                /> */}

                {symbol.length > 10 && (
                  <InputErrorTip msg="Symbol must be less than 10 character" />
                )}

                <InputItem
                  label="Validator Address"
                  value={validatorAddress}
                  onChange={(v) => setValidatorAddress(v)}
                  placeholder="Validator Address"
                />
                {isValidatorAddressInvalid && (
                  <InputErrorTip msg="Validator address is invalid" />
                )}
              </div>

              <div className="w-[5.47rem] mx-auto mt-[.24rem]">
                <TipBar
                  content="Commission fee is set defaults as 10%, StaFi Stack Fee set as 10%."
                  link={`${getDocHost()}/develop_sol_lsd/deploy/#rewards-distribution`}
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
                href={`${getDocHost()}/develop_sol_lsd/deploy/#parameter-tips`}
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
              - Manage validators
              <br />
              - Change balancer account
              <br />
              - Adjust commission fee
              <br />
              - Adjust unbonding duration
              <br />
              - Adjust the minimum stake amount
              <br />
              <br />
              Validator Address: Vote Account of the validator
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

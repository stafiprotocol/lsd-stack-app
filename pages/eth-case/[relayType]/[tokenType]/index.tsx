import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { getDocHost } from 'config/common';
import { getFactoryContract } from 'config/eth/contract';
import { getEthereumChainId } from 'config/eth/env';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
import { useEffect, useMemo, useState } from 'react';
import { setBackRoute } from 'redux/reducers/AppSlice';
import {
  createLsdNetworkCustomCustom,
  createLsdNetworkCustomStandard,
  demoCreateLsdNetworkStandard,
  queryLsdTokenInWhiteList,
  setLsdTokenInWhiteListInfo,
} from 'redux/reducers/LsdSlice';
import { getInjectedConnector } from 'utils/commonUtils';
import snackbarUtil from 'utils/snackbarUtils';
import { validateAddress } from 'utils/web3Utils';
import {
  useAccount,
  useConnect,
  useContractWrite,
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
          relayType: 'customize',
          tokenType: 'customize',
        },
      },
      {
        params: {
          relayType: 'customize',
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
  const { lsdTokenInWhiteListInfo } = useAppSelector((state) => state.lsd);

  const { connectors, connectAsync } = useConnect();
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();
  const { switchNetwork } = useSwitchNetwork();

  const [voterParamsOpened, setVoterParamsOpened] = useState(false);
  const [tokenName, setTokenName] = useState('StaFi rETH');
  const [symbol, setSymbol] = useState('rETH');
  const [ownerAddress, setOwnerAddress] = useState(
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  );
  const [lsdTokenAddress, setLsdTokenAddress] = useState(
    '0x5b01439ab024Ba75B7B1f9c05aB55fa25e402809'
  );
  const [voteNumber, setVoteNumber] = useState('3');
  const [threshold, setThreshold] = useState('2');
  const [votersAddrs, setVotersAddrs] = useState<string[]>([]);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [paramList, setParamList] = useState<ParamItem[]>([]);

  const [btnContent, setBtnContent] = useState<
    'Connect Wallet' | 'Switch Network' | 'Submit'
  >('Submit');
  const [submittable, setSubmittable] = useState(false);

  const tokenType = useMemo(() => {
    return router.query.tokenType;
  }, [router]);

  const isOwnerAddressValid = useMemo(() => {
    return Web3.utils.isAddress(ownerAddress);
  }, [ownerAddress]);

  const btnType = useMemo(() => {
    if (metaMaskAccount && metaMaskChainId !== getEthereumChainId()) {
      return 'secondary';
    }
    return 'primary';
  }, [metaMaskAccount, metaMaskChainId]);

  const changeVotersAddrs = (addr: string, index: number) => {
    setVotersAddrs((prev) => {
      const list = [...prev];
      list[index] = addr;
      return list;
    });
  };

  const submit = async () => {
    if (!submittable) return;
    if (!voterParamsOpened) {
      const list = [];
      const voters = [
        '0x51a1cb1efda3eC0fbBb1748B3a55FCAB2154aDcE',
        '0xFb8d9179C0741285f3623146a390D07c0f83Bb82',
        '0x5b01439ab024Ba75B7B1f9c05aB55fa25e402809',
      ];
      for (let i = 0; i < Number(voteNumber); i++) {
        list.push(voters[i % 3]);
      }
      setVotersAddrs(list);
      setVoterParamsOpened(true);
    } else {
      if (tokenType === 'standard') {
        setParamList(
          [
            { name: 'Token Name', value: tokenName },
            { name: 'Symbol', value: symbol },
            { name: 'Owner Address', value: ownerAddress },
            { name: 'Voter Number', value: voteNumber },
            { name: 'Threshold', value: threshold },
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
            { name: 'Threshold', value: threshold },
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
      router.replace('/eth-case');
    }
  };

  const create = () => {
    const cb = (success: boolean) => {
      if (success) {
        router.push(`/eth-case/customize/${tokenType}/review`);
      }
    };
    dispatch(demoCreateLsdNetworkStandard(cb));
  };

  useEffect(() => {
    dispatch(
      setLsdTokenInWhiteListInfo({
        inWhiteList: true,
        queryLoading: false,
      })
    );
  }, [dispatch]);

  useEffect(() => {
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
            Number(voteNumber) > 0 &&
            !!threshold &&
            Number(threshold) > 0 &&
            Number(threshold) <= Number(voteNumber) &&
            Number(threshold) > Number(voteNumber) / 2
        );
      } else {
        setSubmittable(
          !!lsdTokenAddress &&
            lsdTokenInWhiteListInfo.inWhiteList &&
            !!ownerAddress &&
            validateAddress(ownerAddress) &&
            !!voteNumber &&
            Number(voteNumber) > 0 &&
            !!threshold &&
            Number(threshold) > 0 &&
            Number(threshold) <= Number(voteNumber) &&
            Number(threshold) > Number(voteNumber) / 2
        );
      }
    } else {
      for (let addr of votersAddrs) {
        if (!addr || !validateAddress(addr)) {
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
    threshold,
    lsdTokenAddress,
    votersAddrs,
    lsdTokenInWhiteListInfo.inWhiteList,
  ]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <div className="mt-[.36rem] flex ">
          <div className={classNames('flex-1 min-w-[6.2rem] w-[6.2rem]')}>
            <div className="bg-color-bg2 rounded-[.3rem] pb-[.14rem] border-[.01rem] border-color-border1">
              <div className="text-[.28rem] leading-[.42rem] font-[700] text-text1 text-center mt-[.24rem]">
                {voterParamsOpened ? 'Voter Address' : 'Set Parameters'}
              </div>

              {!voterParamsOpened ? (
                <div className="w-[5.47rem] mx-auto mt-[.32rem] gap-[.16rem] flex flex-col">
                  {tokenType === 'standard' && (
                    <>
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
                    label="Vote Number"
                    value={voteNumber}
                    onChange={(v) => setVoteNumber(v)}
                    placeholder="Suggest to set more than 8"
                  />
                  {voteNumber !== '' && Number(voteNumber) === 0 && (
                    <InputErrorTip msg="Vote number must be greater than 0" />
                  )}

                  <InputItem
                    isNumber
                    label="Threshold"
                    value={threshold}
                    onChange={(v) => setThreshold(v)}
                    placeholder="At least voters / 2, no more than all voters' number"
                  />
                  {threshold !== '' && Number(threshold) <= 0 && (
                    <InputErrorTip msg="Threshold must be greater than 0" />
                  )}
                  {threshold !== '' &&
                    voteNumber !== '' &&
                    Number(threshold) > 0 &&
                    Number(threshold) <= Number(voteNumber) / 2 && (
                      <InputErrorTip msg="Threshold must be greater than voters / 2" />
                    )}
                  {threshold !== '' &&
                    voteNumber !== '' &&
                    Number(threshold) > Number(voteNumber) && (
                      <InputErrorTip msg="Threshold must be no more than vote number" />
                    )}
                </div>
              ) : (
                <div className="px-[.26rem] mx-auto mt-[.32rem] gap-[.16rem] flex flex-col max-h-[3.6rem] overflow-y-auto">
                  <InputItem
                    disabled
                    label="Voter Number"
                    value={voteNumber}
                    onChange={() => {}}
                    placeholder="At least voters / 2, no more than all voters' number"
                  />

                  {votersAddrs.map((item, index) => (
                    <div key={index} className="flex flex-col gap-[.16rem]">
                      <InputItem
                        label={`Voter ${index + 1} Addr`}
                        value={item}
                        onChange={(v) => changeVotersAddrs(v, index)}
                        placeholder="Example: 0x..."
                      />
                      {!!item && !validateAddress(item) && (
                        <div className="pl-[.2rem]">
                          <InputErrorTip msg="Voter address is invalid" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

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
                href={`${getDocHost()}/develop_eth_lsd/deploy/#parameter-tips`}
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
              - Nominate voter manager
              <br />
              - Adjust parameters
              <br />
              <br />
              Voter Number:
              <br />
              - How many voters you intend to set
              <br />
              - Minimum number is 3, highly recommend to set more than 8
              <br />
              - Each voter proposes new states of the network
              <br />
              - The more voters you set the more decentralized advantages the
              network gets
              <br />
              <br />
              Threshold:
              <br />
              - The minimum number of votes required to approve a proposal
              <br />
              - Recommended value is (voter number*2/3)
              <br />
              - Minimum number is (voter number+1)/2
              <br />- Maximum number is voter number which is not recommended
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

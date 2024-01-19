import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import { ConfirmModal, ParamItem } from 'components/modal/ConfirmModal';
import { getEthereumChainId } from 'config/env';
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
  queryLsdTokenInWhiteList,
  setLsdTokenInWhiteListInfo,
} from 'redux/reducers/LsdSlice';
import { connectMetaMask } from 'redux/reducers/WalletSlice';

const ParameterPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();
  const { lsdTokenInWhiteListInfo } = useAppSelector((state) => state.lsd);

  const [voterParamsOpened, setVoterParamsOpened] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [lsdTokenAddress, setLsdTokenAddress] = useState('');
  const [voteNumber, setVoteNumber] = useState('');
  const [threshold, setThreshold] = useState('');
  const [votersAddrs, setVotersAddrs] = useState<string[]>([]);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [paramList, setParamList] = useState<ParamItem[]>([]);

  const tokenType = useMemo(() => {
    return router.query.tokenType;
  }, [router]);

  const [submittable, btnContent] = useMemo(() => {
    if (!metaMaskAccount) return [true, 'Connect Wallet'];
    if (Number(metaMaskChainId) !== getEthereumChainId()) {
      return [true, 'Switch Network'];
    }

    if (tokenType === 'customize' && !lsdTokenInWhiteListInfo.inWhiteList) {
      return [false, 'Submit'];
    }
    if (!voterParamsOpened) {
      if (tokenType === 'standard') {
        return [
          !!tokenName &&
            !!symbol &&
            !!ownerAddress &&
            !!voteNumber &&
            !!threshold,
          'Submit',
        ];
      } else {
        return [
          !!lsdTokenAddress && !!ownerAddress && !!voteNumber && !!threshold,
          'Submit',
        ];
      }
    } else {
      return [votersAddrs.find((addr) => !addr) !== '', 'Submit'];
    }
  }, [
    tokenName,
    symbol,
    ownerAddress,
    tokenType,
    voteNumber,
    lsdTokenAddress,
    threshold,
    voterParamsOpened,
    votersAddrs,
    metaMaskAccount,
    metaMaskChainId,
    lsdTokenInWhiteListInfo,
  ]);

  const changeVotersAddrs = (addr: string, index: number) => {
    setVotersAddrs((prev) => {
      const list = [...prev];
      list[index] = addr;
      return list;
    });
  };

  const submit = () => {
    if (!metaMaskAccount || Number(metaMaskChainId) !== getEthereumChainId()) {
      dispatch(connectMetaMask(getEthereumChainId()));
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
      dispatch(setBackRoute('tokenStandard'));
      router.replace('/');
    }
  };

  const create = () => {
    const cb = (success: boolean) => {
      if (success) {
        router.push(`/customize/${tokenType}/review`);
      }
    };
    if (tokenType === 'standard') {
      dispatch(
        createLsdNetworkCustomStandard(
          tokenName,
          symbol,
          ownerAddress,
          votersAddrs,
          Number(threshold),
          cb
        )
      );
    } else {
      dispatch(
        createLsdNetworkCustomCustom(
          lsdTokenAddress,
          ownerAddress,
          votersAddrs,
          Number(threshold),
          cb
        )
      );
    }
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
    if (!!lsdTokenAddress) {
      dispatch(queryLsdTokenInWhiteList(lsdTokenAddress));
    }
  }, [dispatch, lsdTokenAddress]);

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
                      <InputItem
                        label="Symbol"
                        value={symbol}
                        onChange={(v) => setSymbol(v)}
                        placeholder="Example: rETH"
                      />
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
                        <div className="text-[.12rem] text-[#FF2782] pl-[1.25rem]">
                          Please contact StaFi stack team to whitelist your LSD
                          token contract.
                        </div>
                      )}
                    </>
                  )}

                  <InputItem
                    label="Owner Address"
                    value={ownerAddress}
                    onChange={(v) => setOwnerAddress(v)}
                    placeholder="control contract upgrades, parameter configuration"
                  />

                  <InputItem
                    isNumber
                    label="Vote Number"
                    value={voteNumber}
                    onChange={(v) => setVoteNumber(v)}
                    placeholder="Suggest to set more than 8"
                  />

                  <InputItem
                    label="Threshold"
                    value={threshold}
                    onChange={(v) => setThreshold(v)}
                    placeholder="At least voters / 2, no more than all voters' number"
                  />
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
                    <InputItem
                      key={index}
                      label={`Voter ${index + 1} Addr`}
                      value={item}
                      onChange={(v) => changeVotersAddrs(v, index)}
                      placeholder="Example: 0x0000000000000000"
                    />
                  ))}
                </div>
              )}

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

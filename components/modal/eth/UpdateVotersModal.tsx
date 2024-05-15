import { Box, Modal } from '@mui/material';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import {
  getEthUserDepositContractAbi,
  getNetworkProposalContractAbi,
} from 'config/eth/contract';
import { getEthereumChainId } from 'config/eth/env';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import snackbarUtil from 'utils/snackbarUtils';
import {
  fetchTransactionReceiptWithWeb3,
  getEthWeb3,
  validateAddress,
} from 'utils/web3Utils';
import { useContractWrite } from 'wagmi';

interface Props {
  open: boolean;
  close: () => void;
  adminAddres: string;
  contractAddress: string;
  currentVoteNumber: string;
  currentThreshold: string;
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const UpdateVotersModal = ({
  open,
  close,
  adminAddres,
  contractAddress,
  currentVoteNumber,
  currentThreshold,
  onConnectWallet,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();

  const [voterParamsOpened, setVoterParamsOpened] = useState(false);
  const [voteNumber, setVoteNumber] = useState('');
  const [threshold, setThreshold] = useState('');
  const [votersAddrs, setVotersAddrs] = useState<string[]>([]);

  const { writeAsync } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: getNetworkProposalContractAbi(),
    functionName: 'takeoverVoterManagement',
    args: [],
  });

  useEffect(() => {
    setVoteNumber('');
    setThreshold('');
    setVoterParamsOpened(false);
  }, [open]);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!metaMaskAccount) {
      return [false, 'Connect Wallet'];
    }
    if (metaMaskChainId !== getEthereumChainId()) {
      return [false, 'Switch Network'];
    }
    if (!voterParamsOpened) {
      if (
        !!voteNumber &&
        Number(voteNumber) > 0 &&
        !!threshold &&
        Number(threshold) > 0 &&
        Number(threshold) <= Number(voteNumber) &&
        Number(threshold) > Number(voteNumber) / 2
      ) {
        return [false, 'Next'];
      }
      return [true, 'Next'];
    }

    for (let addr of votersAddrs) {
      if (!addr || !validateAddress(addr)) {
        return [true, 'Submit'];
      }
    }

    return [false, 'Submit'];
  }, [
    metaMaskAccount,
    metaMaskChainId,
    voteNumber,
    threshold,
    votersAddrs,
    voterParamsOpened,
  ]);

  useEffect(() => {
    if (!isNaN(Number(voteNumber)) && Number(voteNumber) > 0) {
      let mid = Math.ceil(Number(voteNumber) / 2);
      if (mid === Number(voteNumber) / 2) {
        mid = Math.min(mid + 1, Number(voteNumber));
      }
      if (mid <= 0) {
        mid = 1;
      }
      setThreshold(mid + '');
    }
  }, [voteNumber]);

  const changeVotersAddrs = (addr: string, index: number) => {
    setVotersAddrs((prev) => {
      const list = [...prev];
      list[index] = addr;
      return list;
    });
  };

  const submit = async () => {
    if (!metaMaskAccount || metaMaskChainId !== getEthereumChainId()) {
      onConnectWallet();
      return;
    }

    if (!voterParamsOpened) {
      const list = [];
      for (let i = 0; i < Number(voteNumber); i++) {
        list.push('');
      }
      setVotersAddrs(list);
      setVoterParamsOpened(true);
      return;
    }

    setLoading(true);

    try {
      const result = await writeAsync({
        args: [adminAddres, votersAddrs, threshold],
      });

      const transactionReceipt = await fetchTransactionReceiptWithWeb3(
        getEthWeb3(),
        result.hash
      );

      if (transactionReceipt?.status) {
        snackbarUtil.success('Update successfully');
        onRefresh();
        close();
      }
    } catch (err: any) {
      console.log({ err });
    }

    setLoading(false);
  };

  return (
    <Modal open={open} onClose={close}>
      <Box
        pt="0"
        sx={{
          backgroundColor: '#ffffff',
          width: '5.79rem',
          borderRadius: '0.16rem',
          outline: 'none',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className="absolute top-[.36rem] right-[.36rem] w-[.16rem] h-[.16rem] cursor-pointer"
          onClick={close}
        >
          <Image src={CloseImg} alt="close" layout="fill" />
        </div>

        <div className="text-[.28rem] leading-[.42rem] font-[700] mt-[.28rem] text-center">
          Set parameter
        </div>

        <div className="mx-[.24rem] mt-[.16rem]">
          {!voterParamsOpened ? (
            <div className=" mt-[.32rem] gap-[.16rem] flex flex-col">
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
            <div className="mt-[.32rem] gap-[.16rem] flex flex-col max-h-[3.6rem] overflow-y-auto">
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
                    placeholder="Example: 0x0000000000000000"
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
        </div>

        {!voterParamsOpened && (
          <div className="mx-[.24rem] mt-[.32rem]">
            <TipBar
              content={`Current Voter Number is ${currentVoteNumber}, Threshold is ${currentThreshold}`}
            />
          </div>
        )}

        <div className="mt-[.56rem] mb-[.36rem] flex justify-center">
          <CustomButton
            width="2.5rem"
            height=".56rem"
            onClick={() => {
              if (voterParamsOpened) {
                setVoterParamsOpened(false);
              } else {
                close();
              }
            }}
            type="stroke"
          >
            Back
          </CustomButton>

          <CustomButton
            loading={loading}
            disabled={buttonDisabled}
            className="ml-[.24rem]"
            width="2.5rem"
            height=".56rem"
            onClick={submit}
          >
            {buttonText}
          </CustomButton>
        </div>
      </Box>
    </Modal>
  );
};

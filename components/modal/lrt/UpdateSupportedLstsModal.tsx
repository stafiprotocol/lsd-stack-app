import { Box, Modal } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { getEthereumChainId } from 'config/eth/env';
import { getLrtStakeManagerAbi } from 'config/lrt/contract';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { LstItem } from 'interfaces/common';
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
  contractAddress: string;
  placeholder: string;
  supportedLsts: LstItem[];
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const UpdateSupportedLstsModal = ({
  open,
  close,
  contractAddress,
  placeholder,
  supportedLsts,
  onConnectWallet,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();

  useEffect(() => {
    setValue('');
  }, [open]);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!metaMaskAccount) {
      return [false, 'Connect Wallet'];
    }
    if (metaMaskChainId !== getEthereumChainId()) {
      return [false, 'Switch Network'];
    }
    if (!value || !validateAddress(value) || !contractAddress) {
      return [true, 'Remove LST'];
    }
    return [false, 'Remove LST'];
  }, [metaMaskAccount, metaMaskChainId, value, contractAddress]);

  const { writeAsync } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: getLrtStakeManagerAbi(),
    functionName: 'removeLst',
    args: [],
  });

  const submit = async () => {
    if (!metaMaskAccount || metaMaskChainId !== getEthereumChainId()) {
      onConnectWallet();
      return;
    }

    setLoading(true);

    try {
      const result = await writeAsync({
        args: [value],
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

        <div className="mx-[.24rem] mt-[.16rem] max-h-[2rem] overflow-y-auto">
          {supportedLsts.map((item) => (
            <div
              key={item.address}
              className={classNames(
                'rounded-[.06rem] border py-[.12rem] flex items-center mb-[.12rem] cursor-pointer',
                value === item.address ? 'border-error' : 'border-divider1'
              )}
              onClick={() => {
                if (loading) {
                  return;
                }
                if (value !== item.address) {
                  setValue(item.address);
                } else {
                  setValue('');
                }
              }}
            >
              <div>
                <div className="ml-[.12rem] text-text1 text-[.16rem]">
                  {item.symbol}
                </div>

                <div className="mt-[.06rem] ml-[.12rem] text-text2 text-[.14rem]">
                  {item.address}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[.56rem] mb-[.36rem] flex justify-center">
          <CustomButton
            width="2.5rem"
            height=".56rem"
            onClick={close}
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

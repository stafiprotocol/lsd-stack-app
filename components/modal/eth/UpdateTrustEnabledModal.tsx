import { Box, Modal } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { IOSSwitch } from 'components/common/CustomSwitch';
import { InputItem } from 'components/common/InputItem';
import {
  getEthNodeDepositContractAbi,
  getEthWithdrawContractAbi,
} from 'config/eth/contract';
import { getEthereumChainId } from 'config/eth/env';
import { robotoBold } from 'config/font';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import snackbarUtil from 'utils/snackbarUtils';
import {
  createWeb3,
  fetchTransactionReceiptWithWeb3,
  getEthWeb3,
} from 'utils/web3Utils';
import { parseEther } from 'viem';
import { useContractWrite } from 'wagmi';

interface Props {
  open: boolean;
  close: () => void;
  contractAddress: string;
  defaultEnabled: boolean;
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const UpdateTrustEnabledModal = ({
  open,
  close,
  contractAddress,
  defaultEnabled,
  onConnectWallet,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();

  useEffect(() => {
    setEnabled(defaultEnabled);
  }, [defaultEnabled]);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!metaMaskAccount) {
      return [false, 'Connect Wallet'];
    }
    if (metaMaskChainId !== getEthereumChainId()) {
      return [false, 'Switch Network'];
    }
    return [false, 'Submit'];
  }, [metaMaskAccount, metaMaskChainId]);

  const { writeAsync } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: getEthNodeDepositContractAbi(),
    functionName: 'setTrustNodeDepositEnabled',
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
        args: [enabled],
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

        <div className="mx-[.24rem] mt-[.16rem] flex items-center justify-between">
          <div
            className={classNames(
              robotoBold.className,
              'text-[.16rem] leading-[.18rem] text-text2 w-[1.2rem]'
            )}
          >
            Trust Node
          </div>

          <div className="flex items-center">
            <div className="mr-[.12rem] text-[.16rem] text-text2 opacity-50">
              {enabled ? 'Enabled' : 'Disabled'}
            </div>

            <IOSSwitch
              disabled={loading}
              defaultChecked={defaultEnabled}
              checked={enabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
              }}
            />
          </div>
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

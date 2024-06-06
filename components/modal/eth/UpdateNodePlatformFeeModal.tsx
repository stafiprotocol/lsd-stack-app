import { Box, Modal } from '@mui/material';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { getEthWithdrawContractAbi } from 'config/eth/contract';
import { getEthereumChainId } from 'config/eth/env';
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
  nodeCommissionPlaceholder: string;
  platformCommissionPlaceholder: string;
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const UpdateNodePlatformFeeModal = ({
  open,
  close,
  contractAddress,
  nodeCommissionPlaceholder,
  platformCommissionPlaceholder,
  onConnectWallet,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [nodeValue, setNodeValue] = useState('');
  const [platformValue, setPlatformValue] = useState('');
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();

  useEffect(() => {
    setNodeValue('');
    setPlatformValue('');
  }, [open]);

  const { writeAsync } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: getEthWithdrawContractAbi(),
    functionName: 'setPlatformAndNodeCommissionRate',
    args: [],
  });

  const nodeValueTooLarge = Number(nodeValue) >= 100;
  const platformValueTooLarge = Number(platformValue) >= 100;

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!metaMaskAccount) {
      return [false, 'Connect Wallet'];
    }
    if (metaMaskChainId !== getEthereumChainId()) {
      return [false, 'Switch Network'];
    }
    if (
      !nodeValue ||
      Number(nodeValue) === 0 ||
      !platformValue ||
      Number(platformValue) === 0 ||
      nodeValueTooLarge ||
      platformValueTooLarge
    ) {
      return [true, 'Submit'];
    }
    return [false, 'Submit'];
  }, [
    metaMaskAccount,
    metaMaskChainId,
    nodeValue,
    platformValue,
    platformValueTooLarge,
    nodeValueTooLarge,
  ]);

  const submit = async () => {
    if (!metaMaskAccount || metaMaskChainId !== getEthereumChainId()) {
      onConnectWallet();
      return;
    }

    setLoading(true);

    try {
      const realNodeValue = Number(nodeValue) / 100 + '';
      const realPlatformValue = Number(platformValue) / 100 + '';

      const result = await writeAsync({
        args: [
          parseEther(realPlatformValue as `${number}`),
          parseEther(realNodeValue as `${number}`),
        ],
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
          <InputItem
            disabled={loading}
            label="Node Fee"
            placeholder={nodeCommissionPlaceholder}
            suffix="%"
            isNumber
            value={nodeValue}
            onChange={setNodeValue}
            className="mt-[.16rem]"
          />
        </div>

        {nodeValueTooLarge && (
          <div className="mt-[.12rem] pl-[.2rem]">
            <InputErrorTip msg="Node Fee must be < 100" />
          </div>
        )}

        <div className="mt-[.16rem] mx-[.24rem]">
          <InputItem
            disabled={loading}
            label="Platform Fee"
            placeholder={platformCommissionPlaceholder}
            suffix="%"
            isNumber
            value={platformValue}
            onChange={setPlatformValue}
            className="mt-[.16rem]"
          />
        </div>

        {platformValueTooLarge && (
          <div className="mt-[.12rem] pl-[.2rem]">
            <InputErrorTip msg="Platform Fee must be < 100" />
          </div>
        )}

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

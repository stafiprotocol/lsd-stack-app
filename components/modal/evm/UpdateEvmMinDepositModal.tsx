import { Box, Modal } from '@mui/material';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { getEvmStakeManagerAbi } from 'config/evm';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { EvmLsdTokenConfig } from 'interfaces/common';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import snackbarUtil from 'utils/snackbarUtils';
import { fetchTransactionReceiptWithWeb3, getWeb3 } from 'utils/web3Utils';
import { parseEther } from 'viem';
import { useContractWrite } from 'wagmi';

interface Props {
  open: boolean;
  close: () => void;
  lsdTokenConfig: EvmLsdTokenConfig;
  contractAddress: string;
  placeholder: string;
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const UpdateEvmMinDepositModal = ({
  open,
  close,
  contractAddress,
  lsdTokenConfig,
  placeholder,
  onConnectWallet,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();

  useEffect(() => {
    setValue('');
  }, [open]);

  const valueTooLarge = Number(value) >= 1000000;

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!metaMaskAccount) {
      return [false, 'Connect Wallet'];
    }
    if (metaMaskChainId !== lsdTokenConfig.chainId) {
      return [false, 'Switch Network'];
    }
    if (!value || Number(value) === 0 || valueTooLarge || !contractAddress) {
      return [true, 'Submit'];
    }
    return [false, 'Submit'];
  }, [
    metaMaskAccount,
    metaMaskChainId,
    value,
    lsdTokenConfig,
    contractAddress,
    valueTooLarge,
  ]);

  const { writeAsync } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: getEvmStakeManagerAbi(lsdTokenConfig.symbol),
    functionName: 'setMinStakeAmount',
    args: [],
  });

  const submit = async () => {
    if (!metaMaskAccount || metaMaskChainId !== lsdTokenConfig.chainId) {
      onConnectWallet();
      return;
    }

    setLoading(true);

    try {
      const result = await writeAsync({
        args: [parseEther(value as `${number}`)],
      });

      const transactionReceipt = await fetchTransactionReceiptWithWeb3(
        getWeb3(lsdTokenConfig.rpc),
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
            label="Min Deposit Amount"
            placeholder={placeholder}
            suffix={lsdTokenConfig.symbol}
            isNumber
            value={value}
            onChange={setValue}
            className="mt-[.16rem]"
          />
        </div>

        {valueTooLarge && (
          <div className="mt-[.12rem] pl-[.2rem]">
            <InputErrorTip msg="Min Deposit Amount must be < 1000000" />
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

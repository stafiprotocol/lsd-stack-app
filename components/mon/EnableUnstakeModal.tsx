import { Box, Modal, Switch } from '@mui/material';
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
import { readContract } from 'wagmi/actions';
import { useContractWrite } from 'wagmi';
import { getUlstStakeManagerAbi } from 'config/ulst';
import classNames from 'classnames';
import { robotoBold } from 'config/font';

interface Props {
  open: boolean;
  close: () => void;
  lsdTokenConfig: EvmLsdTokenConfig;
  contractAddress: string;
  placeholder: boolean;
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const EnableUnstakeModal = ({
  open,
  close,
  contractAddress,
  lsdTokenConfig,
  placeholder,
  onConnectWallet,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(!placeholder);
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();

  useEffect(() => {
    setEnabled(!placeholder);
  }, [open]);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!metaMaskAccount) {
      return [false, 'Connect Wallet'];
    }
    if (metaMaskChainId !== lsdTokenConfig.chainId) {
      return [false, 'Switch Network'];
    }
    return [false, 'Submit'];
  }, [metaMaskAccount, metaMaskChainId, lsdTokenConfig, contractAddress]);

  const { writeAsync } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: getUlstStakeManagerAbi(),
    functionName: 'setIsUnstakePaused',
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
        args: [!enabled],
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
          <div className="flex justify-between items-center h-[.5rem]">
            <div
              className={classNames(
                robotoBold.className,
                'text-[.16rem] leading-[.18rem] text-text2 w-[1.4rem] break-words'
              )}
            >
              Enable Unstake
            </div>

            <div className="flex-1 w-full h-[.5rem] relative flex items-center">
              <Switch
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                sx={{
                  '& .Mui-checked': {
                    color: '#8ddbcb',
                  },
                }}
              />
            </div>
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

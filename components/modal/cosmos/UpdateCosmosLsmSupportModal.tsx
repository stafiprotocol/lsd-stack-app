import { Box, Modal } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { IOSSwitch } from 'components/common/CustomSwitch';
import { InputItem } from 'components/common/InputItem';
import { neutronChainConfig } from 'config/cosmos/chain';
import { getEthUserDepositContractAbi } from 'config/eth/contract';
import { getEthereumChainId } from 'config/eth/env';
import { robotoBold } from 'config/font';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { getSigningStakeManagerClient } from 'utils/cosmosUtils';
import { amountToChain } from 'utils/numberUtils';
import snackbarUtil from 'utils/snackbarUtils';
import { fetchTransactionReceiptWithWeb3, getEthWeb3 } from 'utils/web3Utils';
import { parseEther } from 'viem';
import { useContractWrite } from 'wagmi';

interface Props {
  open: boolean;
  close: () => void;
  pool_addr: string;
  defaultEnabled: boolean;
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const UpdateCosmosLsmSupportModal = ({
  open,
  close,
  pool_addr,
  defaultEnabled,
  onConnectWallet,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const neutronAccount = useCosmosChainAccount(neutronChainConfig.chainId);

  useEffect(() => {
    setEnabled(defaultEnabled);
  }, [defaultEnabled]);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!neutronAccount?.bech32Address) {
      return [false, 'Connect Wallet'];
    }
    return [false, 'Submit'];
  }, [neutronAccount?.bech32Address]);

  const submit = async () => {
    setLoading(true);

    const stakeManagerClient = await getSigningStakeManagerClient();

    if (!neutronAccount?.bech32Address || !stakeManagerClient) {
      setLoading(false);
      onConnectWallet();
      return;
    }

    try {
      const fee = {
        amount: [
          {
            denom: 'untrn',
            amount: '1',
          },
        ],
        gas: '1000000',
      };

      const executeResult = await stakeManagerClient?.configPool(
        neutronAccount.bech32Address,
        {
          // @ts-ignore
          pool_addr,
          lsm_support: enabled,
        },
        fee
      );

      if (executeResult?.transactionHash) {
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
            LSM Support
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

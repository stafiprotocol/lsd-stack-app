import { Box, Modal } from '@mui/material';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { neutronChainConfig } from 'config/cosmos/chain';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { getSigningStakeManagerClient } from 'utils/cosmosUtils';
import snackbarUtil from 'utils/snackbarUtils';

interface Props {
  open: boolean;
  close: () => void;
  pool_addr: string;
  placeholder: string;
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const UpdateCosmosEraSecondsModal = ({
  open,
  close,
  pool_addr,
  placeholder,
  onConnectWallet,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const neutronAccount = useCosmosChainAccount(neutronChainConfig.chainId);

  useEffect(() => {
    setValue('');
  }, [open]);

  const valueInvalid =
    !!value && (Number(value) < 28800 || Number(value) > 86400);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!neutronAccount?.bech32Address) {
      return [false, 'Connect Wallet'];
    }
    if (!value || Number(value) === 0 || valueInvalid) {
      return [true, 'Submit'];
    }
    return [false, 'Submit'];
  }, [neutronAccount?.bech32Address, value, valueInvalid]);

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
          era_seconds: Number(value),
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

        <div className="mx-[.24rem] mt-[.16rem]">
          <InputItem
            disabled={loading}
            label="Min Deposit Amount"
            placeholder={placeholder}
            suffix="s"
            isNumber
            value={value}
            onChange={setValue}
            className="mt-[.16rem]"
          />

          {valueInvalid && (
            <InputErrorTip msg="Reward Update Period must be between 28800 ~ 86400" />
          )}
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
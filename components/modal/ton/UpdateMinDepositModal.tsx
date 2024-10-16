import { Box, Modal } from '@mui/material';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { CustomButton } from 'components/common/CustomButton';
import { InputItem } from 'components/common/InputItem';
import { useAppDispatch } from 'hooks/common';
import { useTonClient } from 'hooks/ton/useTonClient';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { sendSetMinStakeAmount } from 'redux/reducers/TonSlice';
import snackbarUtil from 'utils/snackbarUtils';

interface Props {
  open: boolean;
  close: () => void;
  contractAddress: string;
  placeholder: string;
  onRefresh: () => void;
}

export const UpdateMinDepositModal = ({
  open,
  close,
  contractAddress,
  placeholder,
  onRefresh,
}: Props) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');

  const [tonConnectUI] = useTonConnectUI();
  const tonClient = useTonClient();

  useEffect(() => {
    setValue('');
  }, [open]);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!value || Number(value) === 0) {
      return [true, 'Submit'];
    }
    return [false, 'Submit'];
  }, [value]);

  const submit = async () => {
    if (!tonClient) return;
    setLoading(true);

    try {
      dispatch(
        sendSetMinStakeAmount(
          tonConnectUI,
          tonClient,
          contractAddress,
          value,
          (success: boolean, cancelled?: boolean) => {
            if (success) {
              if (!cancelled) {
                snackbarUtil.success('Update successfully');
              }
            } else {
              snackbarUtil.error('Update failed');
            }
            onRefresh();
            close();
            setLoading(false);
          }
        )
      );
    } catch (err: any) {
      console.log({ err });
      setLoading(false);
    }
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
            suffix="TON"
            isNumber
            value={value}
            onChange={setValue}
            className="mt-[.16rem]"
          />
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

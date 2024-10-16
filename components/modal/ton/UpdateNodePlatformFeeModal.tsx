import { Box, Modal } from '@mui/material';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { useAppDispatch } from 'hooks/common';
import { useTonClient } from 'hooks/ton/useTonClient';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { sendSetPlatformCommissionRate } from 'redux/reducers/TonSlice';
import snackbarUtil from 'utils/snackbarUtils';

interface Props {
  open: boolean;
  close: () => void;
  contractAddress: string;
  platformCommissionPlaceholder: string;
  onRefresh: () => void;
}

export const UpdatePlatformFeeModal = ({
  open,
  close,
  contractAddress,
  platformCommissionPlaceholder,
  onRefresh,
}: Props) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [platformValue, setPlatformValue] = useState('');

  const [tonConnectUI] = useTonConnectUI();
  const tonClient = useTonClient();

  useEffect(() => {
    setPlatformValue('');
  }, [open]);

  const platformValueTooLarge = Number(platformValue) >= 100;

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (
      !platformValue ||
      Number(platformValue) === 0 ||
      platformValueTooLarge
    ) {
      return [true, 'Submit'];
    }
    return [false, 'Submit'];
  }, [platformValue]);

  const submit = async () => {
    if (!tonClient) return;
    setLoading(true);

    try {
      dispatch(
        sendSetPlatformCommissionRate(
          tonConnectUI,
          tonClient,
          contractAddress,
          platformValue,
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

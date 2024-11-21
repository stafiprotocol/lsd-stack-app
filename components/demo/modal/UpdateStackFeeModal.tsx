import { Box, Modal } from '@mui/material';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { sleep } from 'utils/commonUtils';
import snackbarUtil from 'utils/snackbarUtils';

interface Props {
  open: boolean;
  close: () => void;
  placeholder: string;
}

export const UpdateStackFeeModal = ({ open, close, placeholder }: Props) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
  }, [open]);

  const valueTooLarge = Number(value) >= 100;

  const submit = async () => {
    setLoading(true);
    await sleep(1000);
    snackbarUtil.success('Update successfully');
    close();
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
            label="Stack Fee"
            placeholder={placeholder}
            suffix="%"
            isNumber
            value={value}
            onChange={setValue}
            className="mt-[.16rem]"
          />
        </div>

        {valueTooLarge && (
          <div className="mt-[.12rem] pl-[.2rem]">
            <InputErrorTip msg="Stack Fee must be < 100" />
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
            className="ml-[.24rem]"
            width="2.5rem"
            height=".56rem"
            onClick={submit}
          >
            Submit
          </CustomButton>
        </div>
      </Box>
    </Modal>
  );
};

import { Box, Modal } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { IOSSwitch } from 'components/common/CustomSwitch';
import { robotoBold } from 'config/font';
import { useWalletAccount } from 'hooks/useWalletAccount';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { sleep } from 'utils/commonUtils';
import snackbarUtil from 'utils/snackbarUtils';

interface Props {
  open: boolean;
  close: () => void;
  defaultEnabled: boolean;
}

export const UpdateSoloEnabledModal = ({
  open,
  close,
  defaultEnabled,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const { metaMaskAccount, metaMaskChainId } = useWalletAccount();

  useEffect(() => {
    setEnabled(defaultEnabled);
  }, [defaultEnabled]);

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

        <div className="mx-[.24rem] mt-[.16rem] flex items-center justify-between">
          <div
            className={classNames(
              robotoBold.className,
              'text-[.16rem] leading-[.18rem] text-text2 w-[1.2rem]'
            )}
          >
            Solo Node
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

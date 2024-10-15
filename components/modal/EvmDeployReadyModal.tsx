import { Box, Modal } from '@mui/material';
import { CustomButton } from 'components/common/CustomButton';
import { getDocHost } from 'config/common';
import { EvmLsdTokenConfig } from 'interfaces/common';
import Image from 'next/image';
import CloseImg from 'public/images/close_white.svg';
import ReadyBgImg from 'public/images/ready_bg.svg';
import { openLink } from 'utils/commonUtils';

interface Props {
  open: boolean;
  close: () => void;
  lsdTokenConfig: EvmLsdTokenConfig;
  lsdTokenName: string;
  relayType: 'standard' | 'customize';
}

export const EvmDeployReadyModal = ({
  open,
  close,
  lsdTokenName,
  lsdTokenConfig,
  relayType,
}: Props) => {
  return (
    <Modal open={open} onClose={close}>
      <Box
        pt="0"
        sx={{
          backgroundColor: '#ffffff',
          width: '3.5rem',
          borderRadius: '0.16rem',
          outline: 'none',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          overflowX: 'hidden',
        }}
      >
        <div className="relative w-[3.66rem] h-[1.16rem]">
          <Image src={ReadyBgImg} alt="ready" layout="fill" />
        </div>

        <div
          className="absolute top-[.24rem] right-[.24rem] w-[.16rem] h-[.16rem] cursor-pointer"
          onClick={close}
        >
          <Image src={CloseImg} alt="close" layout="fill" />
        </div>

        <div className="text-[.24rem] leading-[.28rem] font-[700] mt-[.16rem] text-center">
          {lsdTokenName} Is Ready Now!
        </div>

        <div className="mt-[.16rem] text-[.16rem] leading-[.24rem] text-text2 w-[2.78rem] mx-auto text-center">
          {relayType === 'standard' ? (
            <div>
              Now you can deploy your own LSD app and begin your product
              journey, Congratulations!
            </div>
          ) : (
            <>
              Now you can{' '}
              <span className="text-text1">run your relay service</span> and{' '}
              <span className="text-text1">deploy your own LSD</span> app,
              Congratulations!
            </>
          )}
        </div>

        <div className="mt-[.48rem] flex justify-center">
          <CustomButton
            width="1.75rem"
            height=".46rem"
            onClick={close}
            type="stroke"
            border="none"
            className="bg-bgPage"
            trRaidus="0"
            brRaidus="0"
            tlRaidus="0"
            blRaidus="0.16rem"
          >
            Got it
          </CustomButton>
          <CustomButton
            width="1.75rem"
            height=".46rem"
            onClick={() => openLink(`${getDocHost()}/develop_evm_lsd/deploy/`)}
            border="none"
            trRaidus="0"
            brRaidus="0.16rem"
            tlRaidus="0"
            blRaidus="0"
            type="modal-bottom"
          >
            Tutorial
          </CustomButton>
        </div>
      </Box>
    </Modal>
  );
};

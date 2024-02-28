import { Box, Modal } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { robotoBold } from 'config/font';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import ReadyBgImg from 'public/images/ready_bg.svg';
import { openLink } from 'utils/commonUtils';
import { getShortAddress } from 'utils/stringUtils';

interface Props {
  open: boolean;
  close: () => void;
  confirm: () => void;
  data: {
    feeCommision: string;
    feeReceiver: string;
    minimalStake: string;
    lsdTokenCodeId: string;
    lsdTokenName: string;
    lsdTokenSymbol: string;
    validatorAddrs: string[];
  };
}

export const CosmosSubmitConfirmModal = ({
  open,
  close,
  confirm,
  data,
}: Props) => {
  return (
    <Modal open={open} onClose={close}>
      <Box
        pt="0"
        sx={{
          backgroundColor: '#ffffff',
          width: '5.8rem',
          borderRadius: '0.16rem',
          outline: 'none',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          overflowX: 'hidden',
        }}
      >
        <div
          className="absolute top-[.32rem] right-[.36rem] w-[.16rem] h-[.16rem] cursor-pointer z-10"
          onClick={close}
        >
          <Image src={CloseImg} alt="close" layout="fill" />
        </div>

        <div className="text-[.28rem] leading-[.28rem] font-[700] mt-[.28rem] text-center">
          Please Confirm...
        </div>

        <div className="max-h-[3rem] overflow-auto">
          <div className="mt-[.42rem] text-[.16rem] text-text2 mx-auto text-center">
            Token Name:{' '}
            <span className={classNames(robotoBold.className)}>
              {data.lsdTokenName}
            </span>
          </div>

          <div className="mt-[.16rem] text-[.16rem] leading-[.24rem] text-text2 mx-auto text-center">
            Token Symbol:{' '}
            <span className={classNames(robotoBold.className)}>
              {data.lsdTokenSymbol}
            </span>
          </div>

          <div className="mt-[.16rem] text-[.16rem] leading-[.24rem] text-text2 mx-auto text-center">
            Fee Receiver:{' '}
            <span className={classNames(robotoBold.className)}>
              {getShortAddress(data.feeReceiver, 7)}
            </span>
          </div>

          <div className="mt-[.16rem] text-[.16rem] leading-[.24rem] text-text2 mx-auto text-center">
            Fee Commission:{' '}
            <span className={classNames(robotoBold.className)}>
              {data.feeCommision}%
            </span>
          </div>

          <div className="mt-[.16rem] text-[.16rem] leading-[.24rem] text-text2 mx-auto text-center">
            Minimal Stake:{' '}
            <span className={classNames(robotoBold.className)}>
              {data.minimalStake}
            </span>
          </div>

          {data.validatorAddrs.map((addr, index) => (
            <div
              key={index}
              className="mt-[.16rem] text-[.16rem] leading-[.24rem] text-text2 mx-auto text-center"
            >
              Validator{index + 1}:{' '}
              <span className={classNames(robotoBold.className)}>
                {getShortAddress(addr, 7)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-[.16rem] flex flex-col items-center ">
          <CustomButton
            type="primary"
            width="5.3rem"
            height=".46rem"
            onClick={confirm}
            border="none"
          >
            Yes, Submit the settings
          </CustomButton>

          <CustomButton
            type="stroke"
            width="5.3rem"
            height=".46rem"
            onClick={close}
            mt=".16rem"
            className="mb-[.36rem]"
          >
            Back
          </CustomButton>
        </div>
      </Box>
    </Modal>
  );
};

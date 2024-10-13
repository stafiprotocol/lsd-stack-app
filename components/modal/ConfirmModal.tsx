import { Box, Modal } from '@mui/material';
import { CustomButton } from 'components/common/CustomButton';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';

export interface ParamItem {
  name: string;
  value: string;
}

interface Props {
  open: boolean;
  close: () => void;
  paramList: ParamItem[];
  create: () => void;
}

export const ConfirmModal = ({ open, close, paramList, create }: Props) => {
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
          Please Confirm...
        </div>

        <div className="max-h-[2.43rem] overflow-y-auto mt-[.42rem]">
          {paramList.map((param, index) => (
            <div
              key={index}
              className="px-[.32rem] text-[.16rem] leading-[.18rem] font-[400] text-text2 mb-[.16rem] flex items-start"
            >
              <div className="w-[1.3rem] text-end">{param.name}:</div>
              <span className="ml-[.12rem] font-[700] break-all w-[3.6rem]">
                {param.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-[.16rem] flex justify-center">
          <CustomButton width="5.31rem" height=".56rem" onClick={create}>
            Yes, Sumbit the settings
          </CustomButton>
        </div>

        <div className="mt-[.16rem] mb-[.36rem] flex justify-center">
          <CustomButton
            width="5.31rem"
            height=".56rem"
            onClick={close}
            type="stroke"
          >
            Back
          </CustomButton>
        </div>
      </Box>
    </Modal>
  );
};

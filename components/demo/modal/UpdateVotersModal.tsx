import { Box, Modal } from '@mui/material';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { TipBar } from 'components/common/TipBar';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { sleep } from 'utils/commonUtils';
import snackbarUtil from 'utils/snackbarUtils';

interface Props {
  open: boolean;
  close: () => void;
  currentVoteNumber: string;
  currentThreshold: string;
}

export const UpdateVotersModal = ({
  open,
  close,
  currentVoteNumber,
  currentThreshold,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const [voterParamsOpened, setVoterParamsOpened] = useState(false);
  const [voteNumber, setVoteNumber] = useState('');
  const [threshold, setThreshold] = useState('');
  const [votersAddrs, setVotersAddrs] = useState<string[]>([]);

  useEffect(() => {
    setVoteNumber('');
    setThreshold('');
    setVoterParamsOpened(false);
  }, [open]);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!voterParamsOpened) {
      if (
        !!voteNumber &&
        Number(voteNumber) > 0 &&
        !!threshold &&
        Number(threshold) > 0 &&
        Number(threshold) <= Number(voteNumber) &&
        Number(threshold) > Number(voteNumber) / 2
      ) {
        return [false, 'Next'];
      }
      return [true, 'Next'];
    }

    return [false, 'Submit'];
  }, [voteNumber, threshold, votersAddrs, voterParamsOpened]);

  useEffect(() => {
    if (!isNaN(Number(voteNumber)) && Number(voteNumber) > 0) {
      let mid = Math.ceil(Number(voteNumber) / 2);
      if (mid === Number(voteNumber) / 2) {
        mid = Math.min(mid + 1, Number(voteNumber));
      }
      if (mid <= 0) {
        mid = 1;
      }
      setThreshold(mid + '');
    }
  }, [voteNumber]);

  const changeVotersAddrs = (addr: string, index: number) => {
    setVotersAddrs((prev) => {
      const list = [...prev];
      list[index] = addr;
      return list;
    });
  };

  const submit = async () => {
    if (!voterParamsOpened) {
      const list = [];
      for (let i = 0; i < Number(voteNumber); i++) {
        list.push('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
      }
      setVotersAddrs(list);
      setVoterParamsOpened(true);
      return;
    }

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
          {!voterParamsOpened ? (
            <div className=" mt-[.32rem] gap-[.16rem] flex flex-col">
              <InputItem
                isNumber
                label="Vote Number"
                value={voteNumber}
                onChange={(v) => setVoteNumber(v)}
                placeholder="Suggest to set more than 8"
              />
              {voteNumber !== '' && Number(voteNumber) === 0 && (
                <InputErrorTip msg="Vote number must be greater than 0" />
              )}

              <InputItem
                isNumber
                label="Threshold"
                value={threshold}
                onChange={(v) => setThreshold(v)}
                placeholder="At least voters / 2, no more than all voters' number"
              />
              {threshold !== '' && Number(threshold) <= 0 && (
                <InputErrorTip msg="Threshold must be greater than 0" />
              )}
              {threshold !== '' &&
                voteNumber !== '' &&
                Number(threshold) > 0 &&
                Number(threshold) <= Number(voteNumber) / 2 && (
                  <InputErrorTip msg="Threshold must be greater than voters / 2" />
                )}
              {threshold !== '' &&
                voteNumber !== '' &&
                Number(threshold) > Number(voteNumber) && (
                  <InputErrorTip msg="Threshold must be no more than vote number" />
                )}
            </div>
          ) : (
            <div className="mt-[.32rem] gap-[.16rem] flex flex-col max-h-[3.6rem] overflow-y-auto">
              <InputItem
                disabled
                label="Voter Number"
                value={voteNumber}
                onChange={() => {}}
                placeholder="At least voters / 2, no more than all voters' number"
              />

              {votersAddrs.map((item, index) => (
                <div key={index} className="flex flex-col gap-[.16rem]">
                  <InputItem
                    label={`Voter ${index + 1} Addr`}
                    value={item}
                    onChange={(v) => changeVotersAddrs(v, index)}
                    placeholder="Example: 0x..."
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {!voterParamsOpened && (
          <div className="mx-[.24rem] mt-[.32rem]">
            <TipBar
              content={`Current Voter Number is ${currentVoteNumber}, Threshold is ${currentThreshold}`}
            />
          </div>
        )}

        <div className="mt-[.56rem] mb-[.36rem] flex justify-center">
          <CustomButton
            width="2.5rem"
            height=".56rem"
            onClick={() => {
              if (voterParamsOpened) {
                setVoterParamsOpened(false);
              } else {
                close();
              }
            }}
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

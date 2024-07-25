import { Box, Modal } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { robotoBold } from 'config/font';
import { useUserAddress } from 'hooks/useUserAddress';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { SetAiValidatorResponseData } from 'interfaces/common';
import { AiValidatorModuleConfig } from 'interfaces/module';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { openLink } from 'utils/commonUtils';
import snackbarUtil from 'utils/snackbarUtils';

interface Props {
  open: boolean;
  userAddress?: string;
  close: () => void;
  onSuccess: (config: AiValidatorModuleConfig) => void;
  currentConfig?: AiValidatorModuleConfig;
}

export const SetAiValidatorModal = ({
  open,
  userAddress,
  close,
  onSuccess,
  currentConfig,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [exampleResponse, setExampleResponse] =
    useState<SetAiValidatorResponseData>();
  const [value, setValue] = useState('');
  const [modelId, setModelId] = useState('');

  useEffect(() => {
    setStep(1);
  }, [open]);

  useEffect(() => {
    if (currentConfig) {
      setModelId(currentConfig.modelId);
      setValue(currentConfig.validatorNumber);
    }
  }, [currentConfig]);

  const valueTooLarge = Number(value) > 20;

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (step === 2) {
      return [false, 'Open Selection Module'];
    }
    // if (!metaMaskAccount) {
    //   return [false, 'Connect Wallet'];
    // }
    // if (metaMaskChainId !== getEthereumChainId()) {
    //   return [false, 'Switch Network'];
    // }
    if (!value || Number(value) === 0 || valueTooLarge || !modelId) {
      return [true, 'Generate Example'];
    }
    return [false, 'Generate Example'];
  }, [userAddress, value, valueTooLarge, modelId, step]);

  const submit = async () => {
    if (!userAddress) {
      return;
    }

    if (step === 2) {
      onSuccess({
        modelId,
        validatorNumber: value,
        prefix: 'cosmos',
      });
      return;
    }

    setLoading(true);
    const params = {
      modelId,
      resultNum: Number(value),
      prefix: 'cosmos',
    };

    const setResponse = await fetch(
      'https://staking-api.stafi.io/election/api/v1/selectedValidators',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    ).catch((err) => {
      snackbarUtil.error(err.message);
    });
    if (!setResponse) {
      setLoading(false);
      return;
    }
    const setResponseJson = await setResponse.json();
    setLoading(false);

    console.log({ setResponseJson });
    if (setResponseJson.status === '80000' && setResponseJson.data) {
      setStep(2);
      setExampleResponse(setResponseJson.data);
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
          Validator Selection AI Agent
        </div>

        {step === 1 ? (
          <>
            <div className="mt-[.32rem] mx-[.24rem]">
              <InputItem
                disabled={loading}
                label={
                  <div>
                    Validator
                    <br />
                    Number
                  </div>
                }
                placeholder={''}
                isNumber
                isInteger
                value={value}
                onChange={setValue}
              />
            </div>

            {valueTooLarge && (
              <div className="mt-[.12rem] pl-[.2rem]">
                <InputErrorTip msg={'Validator Number must be <= 20'} />
              </div>
            )}

            <div className="mx-[.24rem]">
              <InputItem
                disabled={loading}
                label={
                  <div>
                    Model
                    <br />
                    Id
                  </div>
                }
                placeholder={'Example: gpt-4o'}
                value={modelId}
                onChange={setModelId}
                className="mt-[.16rem]"
              />

              <InputItem
                disabled={true}
                label={<div>Prefix</div>}
                placeholder={''}
                isNumber
                isInteger
                value={'cosmos'}
                onChange={() => {}}
                className="mt-[.16rem]"
              />
            </div>
          </>
        ) : (
          <div className="mt-[.32rem] mx-[.24rem] bg-[#E8EFFD] rounded-[.3rem] text-[.16rem] max-h-[4rem] overflow-auto p-[.24rem]">
            {exampleResponse?.recommendedValidators?.map((item, index) => (
              <div key={index} className="mb-[.32rem] leading-snug">
                <div className={classNames('text-text1', robotoBold.className)}>
                  Validator {index + 1}:
                </div>

                <div className="mt-[.12rem]">
                  <span className="text-text1">Address:</span>
                  <span className="text-text2 ml-[.06rem] break-all">
                    {item.operatorAddress}
                  </span>
                </div>

                <div className="mt-[.12rem]">
                  <span className="text-text1">Reasons:</span>
                  <span className="text-text2 ml-[.06rem] break-all">
                    {item.reasons.join('; ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-[.56rem] mb-[.36rem] flex justify-center mx-[.24rem]">
          <CustomButton
            width="2.5rem"
            height=".56rem"
            onClick={() => {
              openLink('https://www.google.com');
            }}
            type="stroke"
          >
            Toturial
          </CustomButton>

          <CustomButton
            loading={loading}
            disabled={buttonDisabled}
            width="2.5rem"
            height=".56rem"
            onClick={submit}
            className="ml-[.2rem]"
          >
            {buttonText}
          </CustomButton>
        </div>
      </Box>
    </Modal>
  );
};

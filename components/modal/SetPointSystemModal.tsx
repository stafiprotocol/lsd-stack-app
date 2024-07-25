import { Box, Modal } from '@mui/material';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { getEthereumChainId } from 'config/eth/env';
import { robotoBold } from 'config/font';
import { useWalletAccount } from 'hooks/useWalletAccount';
import { AppEco } from 'interfaces/common';
import { PointModuleConfig } from 'interfaces/module';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import EcoSelectedImg from 'public/images/eco/selected.svg';
import EcoUnselectedImg from 'public/images/eco/unselected.svg';
import { useEffect, useMemo, useState } from 'react';

interface Props {
  eco: AppEco;
  userAddress?: string;
  open: boolean;
  close: () => void;
  currentConfig?: PointModuleConfig;
  onSuccess: (config: PointModuleConfig) => void;
}

export const SetPointSystemModal = ({
  open,
  eco,
  userAddress,
  close,
  onSuccess,
  currentConfig,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const [minimalDeposit, setMinimalDeposit] = useState('');

  const baseTokenName =
    eco === AppEco.Eth
      ? 'ETH'
      : eco === AppEco.Evm
      ? 'SEI'
      : eco === AppEco.Cosmos
      ? 'ATOM'
      : eco === AppEco.Lrt
      ? 'ETH'
      : '';

  useEffect(() => {
    if (currentConfig) {
      setFrequency(currentConfig.frequency);
      setValue(currentConfig.speed);
      setMinimalDeposit(currentConfig.minimalDeposit);
    }
  }, [currentConfig]);

  const [frequency, setFrequency] = useState<'1 day' | '1 hour'>('1 day');

  const valueTooLarge = Number(value) >= 10000;

  const [buttonDisabled, buttonText] = useMemo(() => {
    // if (!metaMaskAccount) {
    //   return [false, 'Connect Wallet'];
    // }
    // if (metaMaskChainId !== getEthereumChainId()) {
    //   return [false, 'Switch Network'];
    // }
    if (
      !value ||
      Number(value) === 0 ||
      valueTooLarge ||
      !minimalDeposit ||
      Number(minimalDeposit) === 0
    ) {
      return [true, 'Set As Your Module'];
    }
    return [false, 'Set As Your Module'];
  }, [userAddress, value, valueTooLarge, minimalDeposit]);

  const submit = async () => {
    if (!userAddress) {
      // onConnectWallet();
      return;
    }
    // setLoading(true);
    // setLoading(false);

    onSuccess({
      frequency: frequency,
      speed: value,
      minimalDeposit,
    });
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
          Point System
        </div>

        <div className="mx-[.24rem] mt-[.16rem]">
          <div
            className={classNames(
              'mt-[.16rem] flex justify-between items-center h-[.5rem]'
            )}
          >
            <div
              className={classNames(
                robotoBold.className,
                'text-[.16rem] leading-[.18rem] text-text2 w-[1.4rem] break-words'
              )}
            >
              Point Snapshot
              <br />
              Frequency
            </div>

            <div className="flex-1 w-full h-[.5rem] relative flex items-center text-text1 text-[.14rem]">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => {
                  setFrequency('1 day');
                }}
              >
                <div className="relative w-[.18rem] h-[.18rem] mr-[.05rem]">
                  <Image
                    src={
                      frequency === '1 day' ? EcoSelectedImg : EcoUnselectedImg
                    }
                    fill
                    alt="check"
                  />
                </div>

                <div className=" ml-[.06rem]">1 Day(24 Hours)</div>
              </div>

              <div
                className="ml-[.36rem] flex items-center cursor-pointer"
                onClick={() => {
                  setFrequency('1 hour');
                }}
              >
                <div className="relative w-[.18rem] h-[.18rem] mr-[.05rem]">
                  <Image
                    src={
                      frequency === '1 hour' ? EcoSelectedImg : EcoUnselectedImg
                    }
                    fill
                    alt="check"
                  />
                </div>

                <div className=" ml-[.06rem]">1 Hour</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-[.24rem]">
          <InputItem
            disabled={loading}
            label={
              frequency === '1 day'
                ? `Points / r${baseTokenName} / Day`
                : `Points / r${baseTokenName} / Hour`
            }
            placeholder={''}
            isNumber
            value={value}
            onChange={setValue}
            className="mt-[.16rem]"
          />
        </div>

        {valueTooLarge && (
          <div className="mt-[.12rem] pl-[.2rem]">
            <InputErrorTip
              msg={
                frequency === '1 day'
                  ? `Points / r${baseTokenName} / Day must be < 10000`
                  : `Points / r${baseTokenName} / Hour must be < 10000`
              }
            />
          </div>
        )}

        <div className="mx-[.24rem]">
          <InputItem
            disabled={loading}
            label={'Minimal Deposit'}
            placeholder={''}
            isNumber
            suffix={baseTokenName}
            value={minimalDeposit}
            onChange={setMinimalDeposit}
            className="mt-[.16rem]"
          />
        </div>

        <div className="mt-[.56rem] mb-[.36rem] flex justify-center mx-[.24rem]">
          {/* <CustomButton
            width="2.5rem"
            height=".56rem"
            onClick={close}
            type="stroke"
          >
            Back
          </CustomButton> */}

          <CustomButton
            loading={loading}
            disabled={buttonDisabled}
            width="100%"
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

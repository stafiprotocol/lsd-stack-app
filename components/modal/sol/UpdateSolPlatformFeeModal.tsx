import { AnchorProvider, BN, Program, setProvider } from '@coral-xyz/anchor';
import { Box, Modal } from '@mui/material';
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { solanaPrograms } from 'config/sol';
import { IDL, LsdProgram } from 'config/sol/idl/lsd_program';
import * as crypto from 'crypto';
import { useUserAddress } from 'hooks/useUserAddress';
import { AppEco } from 'interfaces/common';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { sleep } from 'utils/commonUtils';
import snackbarUtil from 'utils/snackbarUtils';

interface Props {
  open: boolean;
  close: () => void;
  stakeManagerAddress: string;
  placeholder: string;
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const UpdateSolPlatformFeeModal = ({
  open,
  close,
  stakeManagerAddress,
  placeholder,
  onConnectWallet,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');

  const userAddress = useUserAddress(AppEco.Sol);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { sendTransaction } = useWallet();

  useEffect(() => {
    setValue('');
  }, [open]);

  const valueTooLarge = Number(value) >= 100;

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!userAddress) {
      return [false, 'Connect Wallet'];
    }
    if (!value || Number(value) === 0 || valueTooLarge) {
      return [true, 'Submit'];
    }
    return [false, 'Submit'];
  }, [userAddress, value, valueTooLarge]);

  const submit = async () => {
    if (!userAddress || !wallet) {
      onConnectWallet();
      return;
    }

    setLoading(true);

    try {
      const realNodeValue = Number(value) / 100 + '';

      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const programId = new PublicKey(solanaPrograms.lsdProgramId);
      const program = new Program<LsdProgram>(IDL, programId);
      const anchorInstruction = await program.methods
        .setPlatformFeeCommission(new BN(Number(value) * 10000000))
        .accounts({
          stakeManager: new PublicKey(stakeManagerAddress),
          admin: new PublicKey(userAddress),
        })
        .instruction();

      const bf = crypto
        .createHash('sha256')
        .update('global:set_platform_fee_commission')
        .digest();
      // console.log(bf);
      const methodData = bf.subarray(0, 8);
      const num = BigInt(Number(value) * 10000000);
      const ab = new ArrayBuffer(8);
      new DataView(ab).setBigInt64(0, num, true);
      // const amountBf = hexToU8a('0x' + num.toString(16));
      const amountData = Buffer.from(ab);
      const data = Buffer.concat([methodData, amountData]);

      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: new PublicKey(stakeManagerAddress),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: new PublicKey(userAddress),
            isSigner: true,
            isWritable: false,
          },
        ],
        programId: programId,
        data: data,
      });

      const transaction = new Transaction();
      transaction.add(anchorInstruction);

      const txid = await sendTransaction(transaction, connection);

      let retryCount = 0;
      while (retryCount < 20) {
        retryCount++;
        const transactionDetail = await connection.getTransaction(txid, {
          commitment: 'finalized',
        });
        console.log({ transactionDetail });
        await sleep(3000);
        if (transactionDetail) {
          break;
        }
      }

      console.log(
        `View on explorer: https://explorer.solana.com/tx/${txid}?cluster=custom`
      );

      if (txid) {
        snackbarUtil.success('Update successfully');
        onRefresh();
        close();
      }
    } catch (err: any) {
      console.log({ err });
    }

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
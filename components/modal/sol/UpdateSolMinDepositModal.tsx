import { AnchorProvider, BN, Program, setProvider } from '@coral-xyz/anchor';
import { Box, Modal } from '@mui/material';
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { CustomButton } from 'components/common/CustomButton';
import { InputErrorTip } from 'components/common/InputErrorTip';
import { InputItem } from 'components/common/InputItem';
import { solanaPrograms } from 'config/sol';
import { IDL, LsdProgram } from 'config/sol/idl/lsd_program';
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

export const UpdateSolMinDepositModal = ({
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

  const valueTooLarge = Number(value) >= 1000000;

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
      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const programId = new PublicKey(solanaPrograms.lsdProgramId);
      const program = new Program<LsdProgram>(IDL, programId);
      const anchorInstruction = await program.methods
        .setMinStakeAmount(new BN(Number(value) * 1000000000))
        .accounts({
          stakeManager: new PublicKey(stakeManagerAddress),
          admin: new PublicKey(userAddress),
        })
        .instruction();

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
            label="Min Deposit Amount"
            placeholder={placeholder}
            suffix="SOL"
            isNumber
            value={value}
            onChange={setValue}
            className="mt-[.16rem]"
          />
        </div>

        {valueTooLarge && (
          <div className="mt-[.12rem] pl-[.2rem]">
            <InputErrorTip msg="Min Deposit Amount must be < 1000000" />
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
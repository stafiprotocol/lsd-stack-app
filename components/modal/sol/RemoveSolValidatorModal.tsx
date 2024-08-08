import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import { Box, Modal } from '@mui/material';
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionResponse } from '@solana/web3.js';
import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { solanaPrograms } from 'config/sol';
import { IDL, LsdProgram } from 'config/sol/idl/lsd_program';
import { useUserAddress } from 'hooks/useUserAddress';
import { AppEco } from 'interfaces/common';
import Image from 'next/image';
import CloseImg from 'public/images/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { sleep } from 'utils/commonUtils';
import snackbarUtil from 'utils/snackbarUtils';
import { sendSolanaTransaction } from 'utils/solanaUtils';

interface Props {
  open: boolean;
  close: () => void;
  stakeManagerAddress: string;
  currentValidators: PublicKey[];
  onConnectWallet: () => void;
  onRefresh: () => void;
}

export const RemoveSolValidatorModal = ({
  open,
  close,
  onConnectWallet,
  onRefresh,
  currentValidators,
  stakeManagerAddress,
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

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (!userAddress) {
      return [false, 'Connect Wallet'];
    }
    if (!value) {
      return [true, 'Remove'];
    }
    return [false, 'Remove'];
  }, [value, userAddress]);

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
        .removeValidator(new PublicKey(value))
        .accounts({
          stakeManager: new PublicKey(stakeManagerAddress),
          admin: new PublicKey(userAddress),
        })
        .instruction();

      const transaction = new Transaction();
      transaction.add(anchorInstruction);

      // const txid = await sendTransaction(transaction, connection);
      const txid = await sendSolanaTransaction(transaction, connection);

      let retryCount = 0;
      let transactionDetail: TransactionResponse | null | undefined = undefined;
      while (retryCount < 20 && txid) {
        retryCount++;
        transactionDetail = await connection.getTransaction(txid, {
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

      if (transactionDetail && !transactionDetail.meta?.err) {
        snackbarUtil.success('Update successfully');
        onRefresh();
        close();
      } else {
        snackbarUtil.error('Update failed, please try again later');
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
          Remove Validator
        </div>

        <div className="mx-[.24rem] mt-[.16rem] max-h-[2rem] overflow-y-auto">
          {currentValidators.map((item) => (
            <div
              key={item.toString()}
              className={classNames(
                'rounded-[.06rem] border py-[.24rem] flex items-center mb-[.12rem] cursor-pointer',
                value === item.toString() ? 'border-error' : 'border-divider1'
              )}
              onClick={() => {
                if (loading) {
                  return;
                }
                if (value !== item.toString()) {
                  setValue(item.toString());
                } else {
                  setValue('');
                }
              }}
            >
              <div>
                <div className="ml-[.12rem] text-text1 text-[.14rem]">
                  {item.toString()}
                </div>
              </div>
            </div>
          ))}
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

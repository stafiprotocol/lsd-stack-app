import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  createInitializeMint2Instruction,
  createMint,
  getMintLen,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { WalletAdapterProps } from '@solana/wallet-adapter-base';
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  TransactionResponse,
} from '@solana/web3.js';
import { getSolanaScanTxUrl } from 'config/explorer';
import { solanaPrograms } from 'config/sol';
import {
  CANCELLED_MESSAGE,
  TRANSACTION_FAILED_MESSAGE,
} from 'constants/common';
import * as crypto from 'crypto';
import { AppThunk } from 'redux/store';
import { sleep } from 'utils/commonUtils';
import snackbarUtil from 'utils/snackbarUtils';
import { isSolanaCancelError } from 'utils/web3Utils';
import { setSubmitLoadingParams } from './AppSlice';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { sendSolanaTransaction } from 'utils/solanaUtils';

export interface SolState {
  solEcoLoading: boolean;
}

const initialState: SolState = {
  solEcoLoading: false,
};

export const lsdSlice = createSlice({
  name: 'sol',
  initialState,
  reducers: {
    setSolEcoLoading: (state: SolState, action: PayloadAction<boolean>) => {
      state.solEcoLoading = action.payload;
    },
  },
});

export const { setSolEcoLoading } = lsdSlice.actions;

export default lsdSlice.reducer;

export const solanaInitializeStakeManager =
  (
    userPublicKey: PublicKey,
    validatorPublicKey: PublicKey,
    connection: Connection,
    sendTransaction: WalletAdapterProps['sendTransaction'],
    onSuccess: (stakeManagerAddress: string) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    if (!userPublicKey) {
      return;
    }

    try {
      dispatch(
        setSubmitLoadingParams({
          status: 'loading',
          modalOpened: true,
          txHash: '',
        })
      );

      const lsdProgramPubkey = new PublicKey(solanaPrograms.lsdProgramId);
      const transferTransaction = new Transaction();
      const transaction = new Transaction();

      let stakeManagerSeed;
      let i = 0;
      let stakeManagerPubkey;
      while (true) {
        stakeManagerSeed = `stake_manager_seed_${i}`;
        stakeManagerPubkey = await PublicKey.createWithSeed(
          userPublicKey,
          stakeManagerSeed,
          lsdProgramPubkey
        );

        const existAccountInfo = await connection.getAccountInfo(
          stakeManagerPubkey
        );
        if (!existAccountInfo) {
          // console.log('stakeManagerPubkey', stakeManagerPubkey.toString());
          break;
        }
        // console.log('exist AccountInfo,  skip i = ', i);
        i++;
      }

      const stakeManagerSpace = 100000;
      const stakeManagerRent =
        await connection.getMinimumBalanceForRentExemption(stakeManagerSpace);

      const lamports = await connection.getMinimumBalanceForRentExemption(0);
      // console.log({ lamports });
      const [stakePoolPubkey, number] = PublicKey.findProgramAddressSync(
        [stakeManagerPubkey.toBuffer(), Buffer.from('pool_seed')],
        lsdProgramPubkey
      );
      // console.log('stakePool:', stakePoolPubkey.toString());

      const mintLamports = await connection.getMinimumBalanceForRentExemption(
        getMintLen([])
      );
      // console.log({ mintLamports });

      // test manual createMint
      // const keypair = Keypair.generate();
      // const testTransaction = new Transaction().add(
      //   SystemProgram.createAccount({
      //     fromPubkey: new PublicKey(userPublicKey),
      //     newAccountPubkey: keypair.publicKey,
      //     space: MINT_SIZE,
      //     lamports,
      //     programId: TOKEN_PROGRAM_ID,
      //   }),
      //   createInitializeMint2Instruction(
      //     keypair.publicKey,
      //     9,
      //     stakePoolPubkey,
      //     null,
      //     TOKEN_PROGRAM_ID
      //   )
      // );
      // const signature = await sendTransaction(testTransaction, connection, {
      // signers: [keypair],
      // });
      // const signature = await sendAndConfirmTransaction(
      //   connection,
      //   testTransaction,
      //   [keypair]
      // );
      // console.log({ signature });

      // create mint
      const newMintKeypair = Keypair.generate();
      // console.log('newMintKeypair:', newMintKeypair.publicKey.toString());

      transferTransaction.add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: newMintKeypair.publicKey,
          lamports: 10000000,
        })
      );

      // const transferTxid = await sendTransaction(
      //   transferTransaction,
      //   connection
      // );
      const transferTxid = await sendSolanaTransaction(
        transferTransaction,
        connection
      );
      // console.log(
      //   `View on explorer: https://explorer.solana.com/tx/${transferTxid}?cluster=custom`
      // );

      while (true) {
        const newMintKeypairAccountInfo = await connection.getAccountInfo(
          newMintKeypair.publicKey
        );
        if (newMintKeypairAccountInfo) {
          // console.log('new Keypair account exist');
          break;
        }
        // console.log('new Keypair account not exist');
        await sleep(3000);
      }

      const mintPubkey = await createMint(
        connection,
        newMintKeypair,
        stakePoolPubkey,
        null,
        9
      );

      // console.log('lsdTokenMintPubkey:', mintPubkey.toString());

      // const mint = Keypair.generate();
      // const mintPubkey = mint.publicKey;
      // transaction.add(
      //   SystemProgram.createAccount({
      //     fromPubkey: userPublicKey,
      //     newAccountPubkey: mint.publicKey,
      //     space: MINT_SIZE,
      //     lamports: mintLamports,
      //     programId: TOKEN_PROGRAM_ID,
      //   }),
      //   createInitializeMint2Instruction(
      //     mint.publicKey,
      //     9,
      //     stakePoolPubkey,
      //     null,
      //     TOKEN_PROGRAM_ID
      //   )
      // );

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: stakePoolPubkey,
          lamports,
        })
      );

      transaction.add(
        SystemProgram.createAccountWithSeed({
          fromPubkey: userPublicKey,
          /** Public key of the created account. Must be pre-calculated with PublicKey.createWithSeed() */
          newAccountPubkey: stakeManagerPubkey,
          /** Base public key to use to derive the address of the created account. Must be the same as the base key used to create `newAccountPubkey` */
          basePubkey: userPublicKey,
          /** Seed to use to derive the address of the created account. Must be the same as the seed used to create `newAccountPubkey` */
          seed: stakeManagerSeed,
          /** Amount of lamports to transfer to the created account */
          lamports: stakeManagerRent,
          /** Amount of space in bytes to allocate to the created account */
          space: stakeManagerSpace,
          /** Public key of the program to assign as the owner of the created account */
          programId: lsdProgramPubkey,
        })
      );

      const stackPubkey = new PublicKey(solanaPrograms.stackProgramId);
      // console.log('stackPubkey:', stackPubkey.toString());
      // console.log('validatorPubkey:', validatorPublicKey.toString());
      const adminPubkey = new PublicKey(userPublicKey);

      const [stackFeeAccountPubkey] = PublicKey.findProgramAddressSync(
        [stackPubkey.toBuffer(), mintPubkey.toBuffer()],
        lsdProgramPubkey
      );

      const bf = crypto
        .createHash('sha256')
        .update('global:initialize_stake_manager')
        .digest();
      // console.log(bf);
      const methodData = bf.subarray(0, 8);
      const data = Buffer.concat([methodData]);

      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: stakeManagerPubkey,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: stackPubkey,
            isSigner: false,
            isWritable: false,
          },
          { pubkey: stakePoolPubkey, isSigner: false, isWritable: false },
          {
            pubkey: stackFeeAccountPubkey,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: mintPubkey,
            isSigner: false,
            isWritable: false,
          },
          { pubkey: validatorPublicKey, isSigner: false, isWritable: false },
          {
            pubkey: userPublicKey,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: adminPubkey,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: ASSOCIATED_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SYSVAR_CLOCK_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: lsdProgramPubkey,
        data: data,
      });
      transaction.add(instruction);

      // const txid = await sendTransaction(transaction, connection, {
      //   skipPreflight: true,
      // });
      const txid = await sendSolanaTransaction(transaction, connection);
      if (!txid) {
        throw new Error(TRANSACTION_FAILED_MESSAGE);
      }

      // console.log(
      //   `View on explorer: https://explorer.solana.com/tx/${txid}?cluster=custom`
      // );

      let transactionDetail: TransactionResponse | null | undefined = undefined;
      let retryCount = 0;
      while (retryCount < 20) {
        retryCount++;
        transactionDetail = await connection.getTransaction(txid, {
          commitment: 'finalized',
        });
        // console.log({ transactionDetail });
        if (transactionDetail) {
          break;
        }
        await sleep(3000);
      }

      if (!transactionDetail) {
        throw new Error(TRANSACTION_FAILED_MESSAGE);
      }

      dispatch(
        setSubmitLoadingParams({
          status: 'success',
          modalOpened: true,
          txHash: txid,
          explorerUrl: getSolanaScanTxUrl(txid),
        })
      );
      onSuccess(stakeManagerPubkey.toString());
    } catch (error: any) {
      console.log(error);
      if (isSolanaCancelError(error)) {
        dispatch(
          setSubmitLoadingParams({
            status: 'error',
            modalOpened: false,
            txHash: '',
          })
        );
        snackbarUtil.error(CANCELLED_MESSAGE);
        return;
      }
      let msg = error.message || TRANSACTION_FAILED_MESSAGE;
      dispatch(
        setSubmitLoadingParams({
          status: 'error',
          modalOpened: true,
          msg,
          txHash: '',
        })
      );
    } finally {
    }
  };

import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { Connection, PublicKey, Signer, Transaction } from '@solana/web3.js';

declare const window: any;

export function getSolanaExtension() {
  if ('phantom' in window) {
    const provider = window.phantom?.solana;

    if (provider?.isPhantom) {
      return provider;
    }
  }

  return undefined;
}

export async function sendSolanaTransaction(
  transaction: Transaction,
  connection: Connection,
  signers?: Signer[]
) {
  try {
    const solana = getSolanaExtension();
    if (!solana || !solana.isConnected) {
      console.log('111');
      return null;
    }

    let { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = solana.publicKey;
    if (signers) {
      transaction.partialSign(...signers);
    }
    let transferSigned = await solana.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(
      transferSigned.serialize(),
      {
        skipPreflight: true,
      }
    );
    return txid;
  } catch (err) {
    console.log({ err });
    return undefined;
  }
}
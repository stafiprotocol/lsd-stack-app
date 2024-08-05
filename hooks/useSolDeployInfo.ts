import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { solanaPrograms } from 'config/sol';
import { IDL, LsdProgram } from 'config/sol/idl/lsd_program';
import { useCallback, useState } from 'react';
import { useAppSelector } from './common';
import { useDebouncedEffect } from './useDebouncedEffect';

export interface SolDeployInfo {
  admin: PublicKey;
  balancer: PublicKey;
  lsdTokenMint: PublicKey;
  stack: PublicKey;
  validators: PublicKey[];
}

export const useSolDeployInfo = (stakeManagerAddress: string) => {
  const { metaMaskAccount } = useAppSelector((state) => state.wallet);

  const [deployInfo, setDeployInfo] = useState<SolDeployInfo | undefined>(
    undefined
  );
  const [fetchLoading, setFetchLoading] = useState(true);

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const fetchDeployInfo = useCallback(async () => {
    try {
      if (!wallet) {
        return;
      }
      const { Connection, PublicKey } = await import('@solana/web3.js');
      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const programId = new PublicKey(solanaPrograms.lsdProgramId);
      const program = new Program<LsdProgram>(IDL, programId);

      const stakeManagerAccount = await program.account.stakeManager.fetch(
        new PublicKey(stakeManagerAddress)
      );
      console.log({ stakeManagerAccount });

      if (stakeManagerAccount) {
        setDeployInfo({
          admin: stakeManagerAccount.admin,
          balancer: stakeManagerAccount.balancer,
          stack: stakeManagerAccount.stack,
          lsdTokenMint: stakeManagerAccount.lsdTokenMint,
          validators: stakeManagerAccount.validators,
        });
      }

      setFetchLoading(false);
    } catch (err: any) {
      console.error(err);
    }
  }, [stakeManagerAddress, connection, wallet]);

  useDebouncedEffect(
    () => {
      fetchDeployInfo();
    },
    [fetchDeployInfo],
    1000
  );

  return { fetchLoading, deployInfo };
};

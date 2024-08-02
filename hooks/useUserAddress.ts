import { AppEco } from 'interfaces/common';
import { useCosmosChainAccount } from './useCosmosChainAccount';
import { neutronChainConfig } from 'config/cosmos/chain';
import { useWalletAccount } from './useWalletAccount';
import { useWallet } from '@solana/wallet-adapter-react';

export function useUserAddress(eco: AppEco | null) {
  // evm
  const { metaMaskAccount } = useWalletAccount();
  // cosmos
  const neutronChainAccount = useCosmosChainAccount(neutronChainConfig.chainId);
  // sol
  const { publicKey } = useWallet();

  const userAddress =
    eco === AppEco.Cosmos
      ? neutronChainAccount?.bech32Address
      : eco === AppEco.Sol
      ? publicKey?.toString()
      : metaMaskAccount;

  return userAddress;
}

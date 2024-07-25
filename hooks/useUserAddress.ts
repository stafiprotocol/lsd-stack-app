import { AppEco } from 'interfaces/common';
import { useCosmosChainAccount } from './useCosmosChainAccount';
import { neutronChainConfig } from 'config/cosmos/chain';
import { useWalletAccount } from './useWalletAccount';

export function useUserAddress(eco: AppEco) {
  const neutronChainAccount = useCosmosChainAccount(neutronChainConfig.chainId);
  const { metaMaskAccount } = useWalletAccount();
  const userAddress =
    eco === AppEco.Cosmos
      ? neutronChainAccount?.bech32Address
      : metaMaskAccount;

  return userAddress;
}

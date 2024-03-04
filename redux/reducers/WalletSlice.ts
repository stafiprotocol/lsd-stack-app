import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AddEthereumChainParameter } from '@web3-react/types';
import { neutronChainConfig } from 'config/cosmos/chain';
import { metaMask } from 'connectors/metaMask';
import { KEPLR_NOT_INSTALLED_MESSAGE } from 'constants/common';
import { AppEco, CosmosAccountMap, CosmosChainConfig } from 'interfaces/common';
import { isKeplrInstalled } from 'utils/commonUtils';
import { _connectKeplr } from 'utils/cosmosUtils';
import snackbarUtil from 'utils/snackbarUtils';
import {
  STORAGE_KEY_DISCONNECT_METAMASK,
  clearCosmosNetworkAllowedFlag,
  isCosmosNetworkAllowed,
  saveStorage,
} from 'utils/storageUtils';
import { AppThunk } from '../store';
import { queryAccountBalances } from '@stafihub/apps-wallet';

export interface WalletState {
  metaMaskAccount: string | undefined;
  metaMaskChainId: string | undefined;
  metaMaskDisconnected: boolean;
  cosmosAccounts: CosmosAccountMap;
}

const initialState: WalletState = {
  metaMaskAccount: undefined,
  metaMaskChainId: undefined,
  metaMaskDisconnected: false,
  cosmosAccounts: {},
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setMetaMaskAccount: (
      state: WalletState,
      action: PayloadAction<string | undefined>
    ) => {
      state.metaMaskAccount = action.payload;
    },
    setMetaMaskChainId: (
      state: WalletState,
      action: PayloadAction<string | undefined>
    ) => {
      state.metaMaskChainId = action.payload;
    },
    setMetaMaskDisconnected: (
      state: WalletState,
      action: PayloadAction<boolean>
    ) => {
      saveStorage(STORAGE_KEY_DISCONNECT_METAMASK, action.payload ? '1' : '');
      state.metaMaskDisconnected = action.payload;
    },
    setCosmosAccounts: (
      state: WalletState,
      action: PayloadAction<CosmosAccountMap>
    ) => {
      state.cosmosAccounts = action.payload;
    },
  },
});

export const {
  setMetaMaskAccount,
  setMetaMaskChainId,
  setMetaMaskDisconnected,
  setCosmosAccounts,
} = walletSlice.actions;

export default walletSlice.reducer;

/**
 * connect to MetaMask.
 */
export const connectMetaMask =
  (
    chainIdOrChaninParams: number | AddEthereumChainParameter,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      const handleError = (err: any) => {
        snackbarUtil.error(err.message);
        cb && cb(false);
      };

      metaMask
        .activate(chainIdOrChaninParams)
        .then(() => {
          cb && cb(true);
        })
        .catch(handleError);

      dispatch(setMetaMaskDisconnected(false));
    } catch (err: unknown) {}
  };

export const updateCosmosAccounts =
  (accountMap: CosmosAccountMap): AppThunk =>
  async (dispatch, getState) => {
    const newAccounts = {
      ...getState().wallet.cosmosAccounts,
      ...accountMap,
    };
    // console.log({ newAccounts });
    dispatch(setCosmosAccounts(newAccounts));
  };

/**
 * Auto connect keplr.
 */
export const autoConnectKeplrChains =
  (): AppThunk => async (dispatch, getState) => {
    const allowedChains: CosmosChainConfig[] = [];

    if (isCosmosNetworkAllowed(neutronChainConfig.chainId)) {
      allowedChains.push(neutronChainConfig);
    }

    if (allowedChains.length === 0) {
      return;
    }
    dispatch(connectKeplrAccount(allowedChains));
  };

/**
 * Connect to Keplr extension.
 */
export const connectKeplrAccount =
  (chainConfigs: CosmosChainConfig[]): AppThunk =>
  async (dispatch, getState) => {
    if (chainConfigs.length === 0) {
      return;
    }
    if (!isKeplrInstalled()) {
      snackbarUtil.error(KEPLR_NOT_INSTALLED_MESSAGE);
      return;
    }

    const requests = chainConfigs.map((chainConfig) => {
      return _connectKeplr(chainConfig);
    });

    const results = await Promise.all(requests);

    const newAccounts: CosmosAccountMap = {};
    results
      .filter((item) => !!item)
      .forEach((account, index) => {
        newAccounts[chainConfigs[index].chainId] = account;
      });

    dispatch(updateCosmosAccounts(newAccounts));
  };

/**
 * update cosmos token balances
 */
export const updateCosmosTokenBalances =
  (): AppThunk => async (dispatch, getState) => {
    const chainConfigs = [neutronChainConfig];

    const requests = chainConfigs.map((chainConfig) => {
      return (async () => {
        try {
          const account = getState().wallet.cosmosAccounts[chainConfig.chainId];
          if (!account) {
            return;
          }
          const newAccount = { ...account };
          const userAddress = newAccount.bech32Address;

          const balances = await queryAccountBalances(chainConfig, userAddress);
          newAccount.allBalances = balances;

          // Prevent disconnect conflict.
          if (
            !getState().wallet.cosmosAccounts[chainConfig.chainId] ||
            getState().wallet.cosmosAccounts[chainConfig.chainId]
              ?.bech32Address !== userAddress
          ) {
            return;
          }
          return { network: chainConfig.chainId, account: newAccount };
        } catch (err: unknown) {
          // console.log(`updateTokenBalance ${chainId} error`, err);
          return null;
        }
      })();
    });

    const results = await Promise.all(requests);

    const accountsMap: CosmosAccountMap = {};
    results.forEach((result) => {
      if (result) {
        accountsMap[result.network] = result.account;
      }
    });
    dispatch(updateCosmosAccounts(accountsMap));
  };

/**
 * disconnect from wallet
 */
export const disconnectWallet = (): AppThunk => async (dispatch, getState) => {
  switch (getState().app.appEco) {
    case AppEco.Eth:
      dispatch(setMetaMaskDisconnected(true));
      break;
    case AppEco.Cosmos:
      const chainId = neutronChainConfig.chainId;
      dispatch(updateCosmosAccounts({ [chainId]: null }));
      clearCosmosNetworkAllowedFlag(chainId);
      break;
  }
};

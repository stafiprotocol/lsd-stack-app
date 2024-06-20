import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { neutronChainConfig } from 'config/cosmos/chain';
import {
  CANCELLED_MESSAGE,
  WALLET_NOT_CONNECTED_MESSAGE,
} from 'constants/common';
import { Coin } from 'gen/neutron/stakeManager';
import { CosmosLsdTokenConfig } from 'interfaces/common';
import { AppThunk } from 'redux/store';
import { isKeplrCancelError, sleep } from 'utils/commonUtils';
import {
  getCosmosTxErrorMsg,
  getNeutronInitPoolFeeAmount,
  getSigningStakeManagerClient,
} from 'utils/cosmosUtils';
import {
  amountToChain,
  chainAmountToHuman,
  formatNumber,
} from 'utils/numberUtils';
import snackbarUtil from 'utils/snackbarUtils';
import { setSubmitLoadingParams } from './AppSlice';

export interface LsdState {
  cosmosEcoLoading: boolean;
}

const initialState: LsdState = {
  cosmosEcoLoading: false,
};

export const lsdSlice = createSlice({
  name: 'lsdCosmos',
  initialState,
  reducers: {
    setCosmosEcoLoading: (state: LsdState, action: PayloadAction<boolean>) => {
      state.cosmosEcoLoading = action.payload;
    },
  },
});

export const { setCosmosEcoLoading } = lsdSlice.actions;

export default lsdSlice.reducer;

export const cosmosRegisterPool =
  (
    connectionId: string,
    interChainId: string,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(setCosmosEcoLoading(true));

      const neutronChainAccount =
        getState().wallet.cosmosAccounts[neutronChainConfig.chainId];
      const signingStakeManagerClient = await getSigningStakeManagerClient();

      if (!neutronChainAccount || !signingStakeManagerClient) {
        throw new Error(WALLET_NOT_CONNECTED_MESSAGE);
      }

      // Check if inter chain ID already exist
      {
        let interChainAccountAddress;
        try {
          interChainAccountAddress =
            await signingStakeManagerClient.queryInterchainAccountAddressFromContract(
              {
                interchain_account_id: interChainId,
              }
            );
        } catch {}

        // console.log({ interChainAccountAddress });
        if (interChainAccountAddress) {
          if (
            interChainAccountAddress.admin !== neutronChainAccount.bech32Address
          ) {
            throw new Error('Duplicate Interchain Account ID');
          }

          if (interChainAccountAddress.pool_address_ica_info.ica_addr) {
            const poolInfo = await signingStakeManagerClient.queryPoolInfo({
              pool_addr:
                interChainAccountAddress.pool_address_ica_info.ica_addr,
            });
            if (poolInfo.lsd_token) {
              throw new Error('Duplicate Interchain Account ID');
            }
          }

          {
            cb && cb(true);
            dispatch(setCosmosEcoLoading(false));
            return;
          }
        }
      }

      const fundResponse = await fetch(
        'https://rest-falcron.pion-1.ntrn.tech/neutron/interchaintxs/params',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const fundResponseJson = await fundResponse.json();
      const funds: Coin[] = [];
      if (
        fundResponseJson.params.register_fee &&
        fundResponseJson.params.register_fee.length > 0
      ) {
        const registerFee = fundResponseJson.params.register_fee[0];

        const ntrnBalance = neutronChainAccount?.allBalances?.find(
          (item) => item.denom === neutronChainConfig.denom
        );

        // console.log();
        if (
          Number(ntrnBalance ? ntrnBalance.amount : 0) <
          Number(registerFee.amount) * 2 + 0.02
        ) {
          throw new Error(
            `Insufficient NTRN balance, need est. ${formatNumber(
              Number(chainAmountToHuman(registerFee.amount * 2, 6)) + 0.02
            )} NTRN for fee`
          );
        }

        funds.push({
          denom: registerFee.denom,
          amount: Number(registerFee.amount) * 2 + '',
        });
      }

      const fee = {
        amount: [
          {
            denom: 'untrn',
            amount: '1',
          },
        ],
        gas: '1000000',
      };

      const executeResult = await signingStakeManagerClient.registerPool(
        neutronChainAccount?.bech32Address,
        {
          connection_id: connectionId,
          interchain_account_id: interChainId,
        },
        fee,
        '',
        funds
      );

      // console.log({ executeResult });
      dispatch(setCosmosEcoLoading(false));

      if (!executeResult?.transactionHash) {
        throw new Error(getCosmosTxErrorMsg(executeResult));
      }

      const maxCount = 20;
      let count = 1;
      while (true) {
        try {
          if (count > maxCount) {
            throw new Error(
              'queryInterchainAccountAddressFromContract Failed, please try again later'
            );
          }
          const interChainAccountAddress =
            await signingStakeManagerClient.queryInterchainAccountAddressFromContract(
              {
                interchain_account_id: interChainId,
              }
            );
          // console.log({ interChainAccountAddress });
          if (interChainAccountAddress) {
            break;
          }
        } catch {
          console.log('interChainAccountAddress not found');
        }

        await sleep(5000);
        count++;
      }

      cb && cb(true);
    } catch (err: any) {
      // console.log({ err });
      dispatch(setCosmosEcoLoading(false));

      if (err.message.startsWith('Insufficient NTRN balance')) {
        snackbarUtil.error(err.message);
        dispatch(
          setSubmitLoadingParams({
            status: 'loading',
            modalOpened: false,
            txHash: '',
          })
        );
      } else if (isKeplrCancelError(err)) {
        snackbarUtil.error(CANCELLED_MESSAGE);
      } else {
        snackbarUtil.error(err.message);
      }
    }
  };

export const cosmosInitPool =
  (
    interChainId: string,
    lsdTokenCodeId: string,
    lsdTokenName: string,
    lsdTokenSymbol: string,
    minimalStake: string,
    realFeeCommision: string,
    feeReceiver: string,
    validatorAddrs: string[],
    lsdTokenConfig: CosmosLsdTokenConfig,
    cb?: (poolAddr: string) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(setCosmosEcoLoading(true));

      const neutronChainAccount =
        getState().wallet.cosmosAccounts[neutronChainConfig.chainId];
      const signingStakeManagerClient = await getSigningStakeManagerClient();

      if (!neutronChainAccount || !signingStakeManagerClient) {
        throw new Error(WALLET_NOT_CONNECTED_MESSAGE);
      }

      const checkTokenCodeResponse = await fetch(
        `https://rest-falcron.pion-1.ntrn.tech/cosmwasm/wasm/v1/code/${lsdTokenCodeId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const checkTokenCodeResponseJson = await checkTokenCodeResponse.json();
      if (!checkTokenCodeResponseJson.code_info) {
        throw new Error('Token Code ID not exist');
      }

      dispatch(
        setSubmitLoadingParams({
          status: 'loading',
          modalOpened: true,
          txHash: '',
        })
      );

      // Check if wallet address match
      {
        let interChainAccountAddress;
        try {
          interChainAccountAddress =
            await signingStakeManagerClient.queryInterchainAccountAddressFromContract(
              {
                interchain_account_id: interChainId,
              }
            );
        } catch {}

        console.log({ interChainAccountAddress });
        if (interChainAccountAddress) {
          if (
            interChainAccountAddress.admin !== neutronChainAccount.bech32Address
          ) {
            throw new Error(
              `Wrong neutron address in your wallet, please switch to ${interChainAccountAddress.admin}`
            );
          }
        }
      }

      const funds: Coin[] = [];
      const fundAmount = await getNeutronInitPoolFeeAmount();

      const ntrnBalance = neutronChainAccount?.allBalances?.find(
        (item) => item.denom === neutronChainConfig.denom
      );

      if (
        Number(ntrnBalance ? ntrnBalance.amount : 0) <
        Number(fundAmount) + 0.02
      ) {
        throw new Error(
          `Insufficient NTRN balance, need est. ${formatNumber(
            Number(chainAmountToHuman(fundAmount, 6)) + 0.02
          )} NTRN for fee`
        );
      }

      funds.push({
        denom: 'untrn',
        amount: fundAmount + '',
      });

      const fee = {
        amount: [
          {
            denom: 'untrn',
            amount: '1',
          },
        ],
        gas: '1000000',
      };

      const executeResult = await signingStakeManagerClient.initPool(
        neutronChainAccount?.bech32Address,
        {
          // @ts-ignore
          channel_id_of_ibc_denom: lsdTokenConfig.channelIdOfIbcDenom,
          ibc_denom: lsdTokenConfig.ibcDenom,
          interchain_account_id: interChainId,
          lsd_token_name: lsdTokenName,
          lsd_token_symbol: lsdTokenSymbol,
          minimal_stake: amountToChain(minimalStake, 6),
          platform_fee_commission: amountToChain(realFeeCommision, 4),
          platform_fee_receiver: feeReceiver,
          remote_denom: lsdTokenConfig.remoteDenom,
          validator_addrs: validatorAddrs,
        },
        fee,
        '',
        funds
      );

      // console.log({ executeResult });
      dispatch(setCosmosEcoLoading(false));

      if (!executeResult?.transactionHash) {
        throw new Error(getCosmosTxErrorMsg(executeResult));
      }

      const maxCount = 20;
      let count = 1;
      let poolAddr = '';
      while (true) {
        try {
          if (count > maxCount) {
            throw new Error(
              'Query pool address Failed, please try again later'
            );
          }
          const interChainAccountAddress =
            await signingStakeManagerClient.queryInterchainAccountAddressFromContract(
              {
                interchain_account_id: interChainId,
              }
            );
          // console.log({ interChainAccountAddress });
          if (
            interChainAccountAddress &&
            interChainAccountAddress.pool_address_ica_info.ica_addr
          ) {
            const poolInfo = await signingStakeManagerClient.queryPoolInfo({
              pool_addr:
                interChainAccountAddress.pool_address_ica_info.ica_addr,
            });
            poolAddr = interChainAccountAddress.pool_address_ica_info.ica_addr;
            if (poolInfo.lsd_token) {
              break;
            }
          }
        } catch {
          console.log('interChainAccountAddress not found');
        }

        await sleep(5000);
        count++;
      }

      dispatch(
        setSubmitLoadingParams({
          status: 'success',
          modalOpened: true,
          txHash: executeResult.transactionHash,
        })
      );
      cb && cb(poolAddr);
    } catch (err: any) {
      dispatch(setCosmosEcoLoading(false));

      if (
        err.message.startsWith('Insufficient NTRN balance') ||
        err.message.startsWith('Wrong neutron address') ||
        err.message.startsWith('Token Code ID not exist')
      ) {
        snackbarUtil.error(err.message);
        dispatch(
          setSubmitLoadingParams({
            status: 'loading',
            modalOpened: false,
            txHash: '',
          })
        );
      } else if (isKeplrCancelError(err)) {
        snackbarUtil.error(CANCELLED_MESSAGE);
        dispatch(
          setSubmitLoadingParams({
            status: 'loading',
            modalOpened: false,
            txHash: '',
          })
        );
      } else {
        dispatch(
          setSubmitLoadingParams({
            status: 'error',
            modalOpened: true,
            txHash: '',
            msg: err.message,
          })
        );
      }
    }
  };

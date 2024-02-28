import {
  connectAtomjs,
  getKeplrAccount,
  getOfflineSigner,
  queryAccountBalances,
} from '@stafihub/apps-wallet';
import { CosmosAccount, CosmosChainConfig } from 'interfaces/common';
import { saveCosmosNetworkAllowedFlag } from './storageUtils';
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from '@cosmjs/cosmwasm-stargate';
import { Client as StakeManagerClient } from 'gen/neutron/stakeManager';
import { neutronChainConfig } from 'config/cosmos/chain';
import { StakeManager } from 'gen/neutron';
import { getNeutronStakeManagerContract } from 'config/cosmos/contract';
import { COMMON_ERROR_MESSAGE } from 'constants/common';

let neutronWasmClient: CosmWasmClient;
let stakeManagerClient: StakeManagerClient;

export async function getNeutronWasmClient() {
  try {
    if (!neutronWasmClient) {
      neutronWasmClient = await CosmWasmClient.connect(
        neutronChainConfig.restEndpoint
      );
    }
  } catch (err: any) {
    console.error(err);
  }

  return neutronWasmClient;
}

export async function getStakeManagerClient() {
  try {
    if (!stakeManagerClient) {
      const wasmClient = await getNeutronWasmClient();
      stakeManagerClient = new StakeManager.Client(
        wasmClient,
        getNeutronStakeManagerContract()
      );
    }
  } catch (err: any) {
    console.error(err);
  }

  return stakeManagerClient;
}

export async function getSigningStakeManagerClient() {
  try {
    const offlineSigner = await getOfflineSigner(neutronChainConfig.chainId);

    if (!offlineSigner) {
      return;
    }

    const signingCosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
      neutronChainConfig.restEndpoint,
      offlineSigner
    );

    const stakeManagerClient = new StakeManager.Client(
      signingCosmWasmClient,
      getNeutronStakeManagerContract()
    );
    return stakeManagerClient;
  } catch (err: any) {
    console.error(err);
  }
}

export const _connectKeplr = async (chainConfig: CosmosChainConfig) => {
  try {
    await connectAtomjs(chainConfig);
    const accountResult = await getKeplrAccount(chainConfig.chainId);

    if (!accountResult) {
      return null;
    }

    const account: CosmosAccount = {
      name: accountResult.name,
      isNanoLedger: accountResult.isNanoLedger,
      bech32Address: accountResult.bech32Address,
    };
    // console.log("account", account);

    const balances = await queryAccountBalances(
      chainConfig,
      account.bech32Address
    );
    account.allBalances = balances;

    saveCosmosNetworkAllowedFlag(chainConfig.chainId);
    return account;
  } catch (err: any) {}
  return null;
};

export function getCosmosTxErrorMsg(response: any) {
  if (!response?.events) {
    return COMMON_ERROR_MESSAGE;
  }
  return JSON.stringify(response.events);
}

export async function getNeutronInitPoolFeeAmount() {
  let fundAmount = 0;

  const fundResponse = await fetch(
    'https://rest-falcron.pion-1.ntrn.tech/neutron/interchainqueries/params',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const fundResponseJson = await fundResponse.json();
  if (
    fundResponseJson.params.query_deposit &&
    fundResponseJson.params.query_deposit.length > 0
  ) {
    const depositFee = fundResponseJson.params.query_deposit[0];
    fundAmount += Number(depositFee.amount) * 4;
  }

  const refundResponse = await fetch(
    'https://rest-falcron.pion-1.ntrn.tech/neutron-org/neutron/feerefunder/params',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const refundResponseJson = await refundResponse.json();
  if (
    refundResponseJson.params.min_fee.recv_fee &&
    refundResponseJson.params.min_fee.recv_fee.length > 0
  ) {
    const recvFee = refundResponseJson.params.min_fee.recv_fee[0];
    fundAmount += Number(recvFee.amount);
  }
  if (
    refundResponseJson.params.min_fee.ack_fee &&
    refundResponseJson.params.min_fee.ack_fee.length > 0
  ) {
    const ackFee = refundResponseJson.params.min_fee.ack_fee[0];
    fundAmount += Number(ackFee.amount);
  }
  if (
    refundResponseJson.params.min_fee.timeout_fee &&
    refundResponseJson.params.min_fee.timeout_fee.length > 0
  ) {
    const timeoutFee = refundResponseJson.params.min_fee.timeout_fee[0];
    fundAmount += Number(timeoutFee.amount);
  }

  return fundAmount;
}

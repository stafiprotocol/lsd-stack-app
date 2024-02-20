import {
  connectAtomjs,
  getKeplrAccount,
  queryAccountBalances,
} from "@stafihub/apps-wallet";
import { CosmosAccount, CosmosChainConfig } from "interfaces/common";
import { saveCosmosNetworkAllowedFlag } from "./storageUtils";

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

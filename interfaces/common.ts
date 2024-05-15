export enum AppEco {
  Eth = 'ETH',
  Cosmos = 'COSMOS',
  Lrt = 'LRT',
  Polkadot = 'Polkadot',
  Others = 'Others',
}

export interface NavigationItem {
  name: string;
  path?: string;
}

export type RelayType = 'standard' | 'customize';

export interface Coin {
  denom: string;
  amount: string;
}

export interface CosmosAccount {
  name: string;
  bech32Address: string;
  isNanoLedger: boolean;
  allBalances?: Coin[];
}

export type CosmosAccountMap = { [key: string]: CosmosAccount | null };

export interface CosmosChainConfig {
  chainId: string;
  chainName: string;
  rpc: string;
  restEndpoint: string;
  denom: string;
  coinDenom: string;
  lsdTokenName?: string;
  decimals: number;
  bech32Config: any;
  gasPriceStep?: any;
  currencies?: [];
  explorerUrl: string;
  defaultApr?: string;
  isNativeKeplrChain?: boolean;
  stakeDisabled?: boolean;
  stakeReserveAmount?: number;
  gasLimit?: string;
  stakeIbcChannel?: string;
}

export interface LsdTokenConfig {
  displayName: string;
  connectionId: string;
  defaultFeeCommission: number;
  lsdTokenCodeId: string;
  channelIdOfIbcDenom: string;
  ibcDenom: string;
  remoteDenom: string;
  bech32PrefixValAddr: string;
  icon: string;
}

export interface LstItem {
  address: string;
  symbol: string;
}

import {
  Address,
  beginCell,
  Builder,
  Cell,
  Contract,
  ContractProvider,
  Dictionary,
  DictionaryValue,
  Sender,
  SendMode,
  Slice,
} from '@ton/core';
import { op } from './common';

export interface StakePoolConfig {
  sequence: bigint;
  totalStakersTon: bigint;
  totalUnstakingTon: bigint;
  totalBorrowersTon: bigint;
  totalBorrowersLoan: bigint;
  totalLsdToken: bigint;
  totalPlatformFee: bigint;
  platformFeeReserved: bigint;

  roundDataDictLength: bigint;
  roundRateDictLength: bigint;

  roundDataDict: Dictionary<bigint, RoundData>;
  roundRateDict: Dictionary<bigint, RoundRate>;

  // addresses
  admin: Address;
  stack: Address;
  lsdTokenMaster: Address | null;

  // params
  minStakeAmount: bigint;
  platformCommissionRate: bigint;
  stackCommissionRate: bigint;
  stopped: boolean;
  stakePodCode: Cell;
}

export enum RoundStatus {
  Open,
  Allocating,
  Allocated,
  Staking,
  Held,
  Finishing,
  Finished,
}

export interface BorrowerInfo {
  loanRate: bigint;
  loanAmount: bigint;
  stakeAmount: bigint;
  newStakeMsg: Cell;
}

export interface RoundData {
  roundStatus?: RoundStatus;
  borrowerCount?: bigint;
  sorted?: Dictionary<bigint, Slice>;
  borrowerInfos?: Dictionary<bigint, BorrowerInfo>;
  iterKey?: bigint;
  currentVsetHash?: bigint;
  stakeHeldFor?: bigint;
  stakeHeldUntil?: bigint;
  availableTon?: bigint;
}

export interface RoundRate {
  rate: bigint;
}

export const sortedDictionaryValue: DictionaryValue<Slice> = {
  serialize: function (src: Slice, builder: Builder) {
    builder.storeSlice(src);
  },
  parse: function (src: Slice): Slice {
    return src;
  },
};

export const borrowerInfoDictionaryValue: DictionaryValue<BorrowerInfo> = {
  serialize: function (src: BorrowerInfo, builder: Builder) {
    builder
      .storeUint(src.loanRate, 16)
      .storeCoins(src.loanAmount)
      .storeCoins(src.stakeAmount)
      .storeRef(src.newStakeMsg);
  },
  parse: function (src: Slice): BorrowerInfo {
    return {
      loanRate: src.loadUintBig(16),
      loanAmount: src.loadCoins(),
      stakeAmount: src.loadCoins(),
      newStakeMsg: src.loadRef(),
    };
  },
};

export const roundDataDictionaryValue: DictionaryValue<RoundData> = {
  serialize: function (src: RoundData, builder: Builder) {
    builder
      .storeUint(src.roundStatus ?? 0, 4)
      .storeUint(src.borrowerCount ?? 0, 16)
      .storeDict(src.sorted)
      .storeDict(src.borrowerInfos)
      .storeUint(src.iterKey ?? 0, 256)
      .storeUint(src.currentVsetHash ?? 0, 256)
      .storeUint(src.stakeHeldFor ?? 0, 32)
      .storeUint(src.stakeHeldUntil ?? 0, 32)
      .storeCoins(src.availableTon ?? 0);
  },
  parse: function (src: Slice): RoundData {
    return {
      roundStatus: src.loadUint(4),
      borrowerCount: src.loadUintBig(16),
      sorted: src.loadDict(Dictionary.Keys.BigUint(196), sortedDictionaryValue),
      borrowerInfos: src.loadDict(
        Dictionary.Keys.BigUint(256),
        borrowerInfoDictionaryValue
      ),
      iterKey: src.loadUintBig(256),
      currentVsetHash: src.loadUintBig(256),
      stakeHeldFor: src.loadUintBig(32),
      stakeHeldUntil: src.loadUintBig(32),
      availableTon: src.loadCoins(),
    };
  },
};

export const roundRateDictionaryValue: DictionaryValue<RoundRate> = {
  serialize: function (src: RoundRate, builder: Builder) {
    builder.storeUint(src.rate, 64);
  },
  parse: function (src: Slice): RoundRate {
    return {
      rate: src.loadUintBig(64),
    };
  },
};

export class StakePool implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new StakePool(address);
  }

  async getBalance(provider: ContractProvider): Promise<bigint> {
    const state = await provider.getState();
    return state.balance;
  }

  async sendMessage(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint | string;
      bounce?: boolean;
      sendMode?: SendMode;
      body?: Cell | string;
    }
  ) {
    await provider.internal(via, opts);
  }

  async sendProxySetContent(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint | string;
      bounce?: boolean;
      sendMode?: SendMode;
      queryId?: bigint;
      dst: Address;
      content: Cell;
    }
  ) {
    await this.sendMessage(provider, via, {
      value: opts.value,
      bounce: opts.bounce,
      sendMode: opts.sendMode,
      body: beginCell()
        .storeUint(0x78570011, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeAddress(opts.dst)
        .storeRef(opts.content)
        .endCell(),
    });
  }

  async sendSetPlatformCommissionRate(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint | string;
      bounce?: boolean;
      sendMode?: SendMode;
      queryId?: bigint;
      rate: bigint;
    }
  ) {
    await this.sendMessage(provider, via, {
      value: opts.value,
      bounce: opts.bounce,
      sendMode: opts.sendMode,
      body: beginCell()
        .storeUint(op.setPlatformCommissionRate, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeUint(opts.rate, 16)
        .endCell(),
    });
  }

  async sendSetMinStakeAmount(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint | string;
      bounce?: boolean;
      sendMode?: SendMode;
      queryId?: bigint;
      minStakeAmount: bigint;
    }
  ) {
    await this.sendMessage(provider, via, {
      value: opts.value,
      bounce: opts.bounce,
      sendMode: opts.sendMode,
      body: beginCell()
        .storeUint(op.setMinStakeAmount, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeCoins(opts.minStakeAmount)
        .endCell(),
    });
  }

  async getStakePoolState(
    provider: ContractProvider
  ): Promise<StakePoolConfig> {
    const { stack } = await provider.get('get_stake_pool_state', []);
    return {
      sequence: stack.readBigNumber(),
      totalStakersTon: stack.readBigNumber(),
      totalUnstakingTon: stack.readBigNumber(),
      totalBorrowersTon: stack.readBigNumber(),
      totalBorrowersLoan: stack.readBigNumber(),
      totalLsdToken: stack.readBigNumber(),
      totalPlatformFee: stack.readBigNumber(),
      platformFeeReserved: stack.readBigNumber(),
      roundDataDictLength: stack.readBigNumber(),
      roundRateDictLength: stack.readBigNumber(),
      roundDataDict: Dictionary.loadDirect(
        Dictionary.Keys.BigUint(32),
        roundDataDictionaryValue,
        stack.readCellOpt()
      ),
      roundRateDict: Dictionary.loadDirect(
        Dictionary.Keys.BigUint(32),
        roundRateDictionaryValue,
        stack.readCellOpt()
      ),
      admin: stack.readAddress(),
      stack: stack.readAddress(),
      lsdTokenMaster: stack.readAddress(),
      minStakeAmount: stack.readBigNumber(),
      platformCommissionRate: stack.readBigNumber(),
      stackCommissionRate: stack.readBigNumber(),
      stopped: stack.readBoolean(),
      stakePodCode: stack.readCell(),
    };
  }
}

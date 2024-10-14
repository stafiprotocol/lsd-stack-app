import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  Sender,
  SendMode,
  TupleBuilder,
} from '@ton/core';

export interface ContractAddresses {
  stakePool: Address;
  lsdTokenMaster: Address;
}

export class Stack implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

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

  async sendNewStakePool(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint | string;
      bounce?: boolean;
      sendMode?: SendMode;
      queryId?: bigint;
      sequence?: bigint;
      content: Cell;
    }
  ) {
    await this.sendMessage(provider, via, {
      value: opts.value,
      bounce: opts.bounce,
      sendMode: opts.sendMode,
      body: beginCell()
        .storeUint(0x04dc78b9, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeUint(opts.sequence ?? 0, 8)
        .storeRef(opts.content)
        .endCell(),
    });
  }

  async getContractAddresses(
    provider: ContractProvider,
    admin: Address,
    sequnce: bigint
  ): Promise<ContractAddresses> {
    const tb = new TupleBuilder();
    tb.writeAddress(admin);
    tb.writeNumber(sequnce);
    const { stack } = await provider.get('get_contract_addresses', tb.build());
    return {
      stakePool: stack.readAddress(),
      lsdTokenMaster: stack.readAddress(),
    };
  }

  async getNewStakePoolFee(provider: ContractProvider): Promise<bigint> {
    const { stack } = await provider.get('get_new_stake_pool_fee', []);
    return stack.readBigNumber();
  }
}

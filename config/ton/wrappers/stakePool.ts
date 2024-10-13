import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  Sender,
  SendMode,
} from '@ton/core';

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
}

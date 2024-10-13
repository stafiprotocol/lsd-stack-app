import {
  Address,
  beginCell,
  Builder,
  Cell,
  Contract,
  ContractProvider,
  DictionaryValue,
  Slice,
} from '@ton/core';
import { sha256_sync } from '@ton/crypto';

export const metadataDictionaryValue: DictionaryValue<string> = {
  serialize: function (src: string, builder: Builder) {
    builder.storeRef(beginCell().storeUint(0, 8).storeStringTail(src));
  },
  parse: function (src: Slice): string {
    const ref = src.loadRef().beginParse();
    const prefix = ref.loadUint(8);
    if (prefix !== 0) {
      throw new Error(
        'Expected metadata dictionary value to start with a zero'
      );
    }
    return ref.loadStringTail();
  },
};

export function toMetadataKey(key: string): bigint {
  return BigInt('0x' + sha256_sync(key).toString('hex'));
}

export class LsdTokenMaster implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new LsdTokenMaster(address);
  }

  async getJettonData(
    provider: ContractProvider
  ): Promise<[bigint, boolean, Address, Cell, Cell]> {
    const { stack } = await provider.get('get_jetton_data', []);
    return [
      stack.readBigNumber(),
      stack.readBoolean(),
      stack.readAddress(),
      stack.readCell(),
      stack.readCell(),
    ];
  }
}

import { useTonAddress } from '@tonconnect/ui-react';
import { useTonClient } from './useTonClient';
import { Stack } from 'config/ton/wrappers/stack';
import { Address, Dictionary } from '@ton/core';
import { stackContractAddress } from 'config/ton';
import { useEffect, useState } from 'react';
import {
  LsdTokenMaster,
  metadataDictionaryValue,
  toMetadataKey,
} from 'config/ton/wrappers/lsdTokenMaster';
import { sleep } from 'utils/commonUtils';
import { isDev } from 'config/common';
import { getStorage, STORAGE_TON_SEQNO } from 'utils/storageUtils';

export interface TonDeployInfo {
  stakePool: string;
  lsdTokenMaster: string;
  tokenName: string;
  tokenDecimals: string;
  tokenSymbol: string;
  tokenDescription: string;
  tokenImage: string;
  ownerAddress: string;
}

export const useDeployInfo = () => {
  const tonAddress = useTonAddress();
  const tonClient = useTonClient();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [deployInfo, setDeployInfo] = useState<TonDeployInfo | null>(null);

  const getDeployInfo = async () => {
    if (!tonClient) return;
    setFetchLoading(true);
    await sleep(3000);

    const seqNoStr = getStorage(STORAGE_TON_SEQNO);
    const seqNo = seqNoStr === null ? 0 : Number(seqNoStr);

    const stack = tonClient.open(
      new Stack(Address.parse(stackContractAddress))
    );
    try {
      const contractAddresses = await stack.getContractAddresses(
        Address.parse(tonAddress),
        BigInt(seqNo)
      );
      const lsdTokenMasterAddress = contractAddresses.lsdTokenMaster.toString({
        testOnly: isDev(),
      });
      const stakePoolAddress = contractAddresses.stakePool.toString({
        testOnly: isDev(),
      });

      const lsdTokenMaster = tonClient.open(
        new LsdTokenMaster(contractAddresses.lsdTokenMaster)
      );

      let jettonData = await lsdTokenMaster.getJettonData();
      const cell = jettonData[3];
      const slice = cell.beginParse();
      const prefix = slice.loadUint(8);
      if (prefix !== 0) {
        console.info('Expected a zero prefix for metadata but got %s', prefix);
        return;
      }
      const metadata = slice.loadDict(
        Dictionary.Keys.BigUint(256),
        metadataDictionaryValue
      );

      const labelsMap: Record<string, string | undefined> = {};
      labelsMap[toMetadataKey('decimals').toString()] = 'decimals';
      labelsMap[toMetadataKey('symbol').toString()] = 'symbol';
      labelsMap[toMetadataKey('name').toString()] = 'name';
      labelsMap[toMetadataKey('description').toString()] = 'description';
      labelsMap[toMetadataKey('image').toString()] = 'image';

      let tokenName = '';
      let tokenSymbol = '';
      let tokenDecimals = '';
      let tokenDescription = '';
      let tokenImage = '';
      for (const key of [
        'decimals',
        'symbol',
        'name',
        'description',
        'image',
      ]) {
        // console.info(
        //   '    %s: %s',
        //   key.padStart(12),
        //   metadata.get(toMetadataKey(key)) ?? ''
        // );
        const value = metadata.get(toMetadataKey(key)) ?? '';
        if (key === 'name') {
          tokenName = value;
        } else if (key === 'symbol') {
          tokenSymbol = value;
        } else if (key === 'decimals') {
          tokenDecimals = value;
        } else if (key === 'description') {
          tokenDescription = value;
        } else if (key === 'image') {
          tokenImage = value;
        }
        metadata.delete(toMetadataKey(key));
      }

      // if (metadata.size > 0) {
      //   console.info('Unknown Keys');
      //   console.info('------------');
      //   for (const key of metadata.keys()) {
      //     console.info('    %s: %s', key.toString(), metadata.get(key));
      //   }
      //   console.info();
      // }

      setDeployInfo({
        stakePool: stakePoolAddress,
        lsdTokenMaster: lsdTokenMasterAddress,
        tokenName,
        tokenDecimals,
        tokenSymbol,
        tokenDescription,
        tokenImage,
        ownerAddress: tonAddress,
      });
      // console.log(stakePoolAddress);
    } catch (err) {
      console.log(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (!tonClient || !tonAddress) return;
    getDeployInfo();
  }, [tonClient, tonAddress]);

  return {
    fetchLoading,
    deployInfo,
  };
};

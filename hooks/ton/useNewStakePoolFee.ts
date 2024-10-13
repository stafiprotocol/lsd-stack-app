import { useEffect, useState } from 'react';
import { useTonClient } from './useTonClient';
import { Stack } from 'config/ton/wrappers/stack';
import { Address } from '@ton/core';
import { stackContractAddress } from 'config/ton';

export const useNewStakePoolFee = () => {
  const [fee, setFee] = useState<bigint | undefined>(undefined);

  const tonClient = useTonClient();

  const getStakePoolFee = async () => {
    if (!tonClient) return;
    try {
      const contract = tonClient.open(
        new Stack(Address.parse(stackContractAddress))
      );
      const fee = await contract.getNewStakePoolFee();
      setFee(fee);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {});
};

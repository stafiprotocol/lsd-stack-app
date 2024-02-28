import dayjs from 'dayjs';
import { useCallback, useRef, useState } from 'react';
import { setNtrnPrice } from 'redux/reducers/TokenSlice';
import { RootState } from 'redux/store';
import { useAppDispatch, useAppSelector } from './common';
import { useDebouncedEffect } from './useDebouncedEffect';
import { getTokenPriceUrl } from 'config/common';

export function usePrice() {
  const updateTimestampRef = useRef<number>(0);
  const dispatch = useAppDispatch();

  const { ntrnPrice } = useAppSelector((state: RootState) => {
    return {
      ntrnPrice: state.token.ntrnPrice,
    };
  });

  const fetchTokenPrice = useCallback(async () => {
    const currentTImestamp = dayjs().unix();
    if (currentTImestamp - updateTimestampRef.current < 30) return; // 30s
    updateTimestampRef.current = currentTImestamp;
    try {
      const response = await fetch(getTokenPriceUrl(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const resJson = await response.json();
      if (resJson) {
        const { usd: ntrnUsd } = resJson['neutron-3'];
        dispatch(setNtrnPrice(ntrnUsd));
      }
    } catch (err: any) {}
  }, [dispatch]);

  useDebouncedEffect(
    () => {
      fetchTokenPrice();
    },
    [fetchTokenPrice],
    1500
  );

  return {
    ntrnPrice,
  };
}

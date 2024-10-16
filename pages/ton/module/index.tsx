import { ModuleDashboard } from 'components/ModuleDashboard';
import {
  ETH_STANDARD_CREATION_STEPS,
  TON_CREATION_STEPS,
} from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useDeployInfo } from 'hooks/useDeployInfo';
import { AppEco } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';

const ModulePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onBack = () => {
    router.replace('/');
  };

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: TON_CREATION_STEPS,
        activedIndex: 3,
      })
    );
  }, [dispatch]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <ModuleDashboard
          eco={AppEco.Ton}
          lsdTokenName={'lsd TON'}
          lsdTokenAddress={'0x0000000000000000000000000000000000000000'}
        />
      </div>
    </div>
  );
};

export default ModulePage;

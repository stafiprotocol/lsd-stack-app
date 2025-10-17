import { ModuleDashboard } from 'components/ModuleDashboard';
import { evmLsdTokens } from 'config/evm';
import {
  ETH_CUSTOMIZE_CREATION_STEPS,
  ULST_CREATION_STEPS,
} from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useUlstDeployInfo } from 'hooks/ulst/useUlstDeployInfo';
import { useDeployInfo } from 'hooks/useDeployInfo';
import { useEvmDeployInfo } from 'hooks/useEvmDeployInfo';
import { AppEco } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';

const ReviewPage = () => {
  const router = useRouter();
  const { fetchLoading, deployInfo } = useUlstDeployInfo();

  const dispatch = useAppDispatch();

  const onBack = () => {
    router.replace('/');
  };

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: ULST_CREATION_STEPS,
        activedIndex: 3,
      })
    );
  }, [dispatch]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <ModuleDashboard
          eco={AppEco.Ulst}
          lsdTokenName={deployInfo?.lsdTokenName}
          lsdTokenAddress={deployInfo?.lsdTokenAddress}
        />
      </div>
    </div>
  );
};

export default ReviewPage;

import { ModuleDashboard } from 'components/ModuleDashboard';
import { LRT_CREATION_STEPS, SOL_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useSolDeployInfo } from 'hooks/useSolDeployInfo';
import { AppEco } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';

const LrtModulePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isSolMainnet = router.query.net === 'mainnet';

  const { fetchLoading, deployInfo } = useSolDeployInfo(
    router.query.stakeManagerAddress as string,
    isSolMainnet
  );
  const [readyModalOpened, setReadyModalOpened] = useState(false);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: SOL_CREATION_STEPS,
        activedIndex: 3,
      })
    );
  }, [dispatch]);

  const onBack = () => {
    router.replace('/');
  };

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <ModuleDashboard
          eco={AppEco.Sol}
          lsdTokenName={'SOL LST'}
          lsdTokenAddress={deployInfo?.lsdTokenMint?.toString()}
        />
      </div>
    </div>
  );
};

export default LrtModulePage;

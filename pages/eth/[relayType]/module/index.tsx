import { ModuleDashboard } from 'components/ModuleDashboard';
import { ETH_STANDARD_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useDeployInfo } from 'hooks/useDeployInfo';
import { AppEco } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';

export function getStaticProps() {
  return { props: {} };
}

export function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          relayType: 'standard',
        },
      },
    ],
    fallback: false,
  };
}

const ReviewPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { fetchLoading, deployInfo } = useDeployInfo('standard');
  console.log({ deployInfo });

  const [readyModalOpened, setReadyModalOpened] = useState(false);

  const onBack = () => {
    router.replace('/');
  };

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: ETH_STANDARD_CREATION_STEPS,
        activedIndex: 4,
      })
    );
  }, [dispatch]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <ModuleDashboard
          eco={AppEco.Eth}
          lsdTokenName={deployInfo?.lsdTokenName}
          lsdTokenAddress={deployInfo?.lsdTokenAddress}
        />
      </div>
    </div>
  );
};

export default ReviewPage;

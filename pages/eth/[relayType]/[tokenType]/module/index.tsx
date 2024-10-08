import { ModuleDashboard } from 'components/ModuleDashboard';
import { ETH_CUSTOMIZE_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useDeployInfo } from 'hooks/useDeployInfo';
import { AppEco } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';

export function getStaticProps() {
  return { props: {} };
}

export function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          relayType: 'customize',
          tokenType: 'customize',
        },
      },
      {
        params: {
          relayType: 'customize',
          tokenType: 'standard',
        },
      },
    ],
    fallback: false,
  };
}

const ReviewPage = () => {
  const { fetchLoading, deployInfo } = useDeployInfo('customize');

  const dispatch = useAppDispatch();
  const router = useRouter();

  const onBack = () => {
    router.replace('/');
  };

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: ETH_CUSTOMIZE_CREATION_STEPS,
        activedIndex: 5,
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

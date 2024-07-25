import { ModuleDashboard } from 'components/ModuleDashboard';
import { evmLsdTokens } from 'config/evm';
import { ETH_CUSTOMIZE_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useDeployInfo } from 'hooks/useDeployInfo';
import { useEvmDeployInfo } from 'hooks/useEvmDeployInfo';
import { AppEco } from 'interfaces/common';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';

export function getStaticProps() {
  return { props: {} };
}

export function getStaticPaths() {
  const paths: any[] = [];
  evmLsdTokens.forEach((token) => {
    paths.push({
      params: {
        token: token.symbol,
        tokenType: 'customize',
      },
    });
    paths.push({
      params: {
        token: token.symbol,
        tokenType: 'standard',
      },
    });
  });

  return {
    paths: paths,
    fallback: false,
  };
}

const ReviewPage = () => {
  const router = useRouter();
  const { fetchLoading, deployInfo } = useEvmDeployInfo(
    router.query.token as string
  );

  const dispatch = useAppDispatch();

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
          eco={AppEco.Evm}
          lsdTokenName={deployInfo?.lsdTokenName}
          lsdTokenAddress={deployInfo?.lsdTokenAddress}
        />
      </div>
    </div>
  );
};

export default ReviewPage;

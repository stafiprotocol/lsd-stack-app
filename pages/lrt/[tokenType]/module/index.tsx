import { Skeleton } from '@mui/material';
import classNames from 'classnames';
import { ModuleDashboard } from 'components/ModuleDashboard';
import { CustomButton } from 'components/common/CustomButton';
import { TipBar } from 'components/common/TipBar';
import { LrtDeployReadyModal } from 'components/modal/LrtDeployReadyModal';
import { getDocHost } from 'config/common';
import { getLrtFactoryContract } from 'config/lrt/contract';
import { LRT_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useLrtDeployInfo } from 'hooks/useLrtDeployInfo';
import { AppEco } from 'interfaces/common';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ExternalLinkImg from 'public/images/external_link.svg';
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
          tokenType: 'customize',
        },
      },
      {
        params: {
          tokenType: 'standard',
        },
      },
    ],
    fallback: false,
  };
}

const LrtModulePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { fetchLoading, deployInfo } = useLrtDeployInfo();
  const [readyModalOpened, setReadyModalOpened] = useState(false);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: LRT_CREATION_STEPS,
        activedIndex: 4,
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
          eco={AppEco.Lrt}
          lsdTokenName={deployInfo?.lrtTokenName}
          lsdTokenAddress={deployInfo?.lrtTokenAddress}
        />
      </div>
    </div>
  );
};

export default LrtModulePage;

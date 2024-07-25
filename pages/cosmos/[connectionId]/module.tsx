import classNames from 'classnames';
import { ModuleDashboard } from 'components/ModuleDashboard';
import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { Icomoon } from 'components/icon/Icomoon';
import { getDocHost } from 'config/common';
import { lsdTokenConfigs } from 'config/cosmos/chain';
import { robotoBold } from 'config/font';
import { COSMOS_CREATION_STEPS } from 'constants/common';
import { LsdToken } from 'gen/neutron';
import { useAppDispatch } from 'hooks/common';
import { AppEco } from 'interfaces/common';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import celebrateIcon from 'public/images/celebrate.png';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { openLink } from 'utils/commonUtils';
import { getNeutronWasmClient, getStakeManagerClient } from 'utils/cosmosUtils';

export async function getStaticPaths() {
  const paths: any[] = [];
  lsdTokenConfigs.forEach((config) => {
    paths.push({ params: { connectionId: config.connectionId } });
  });

  return {
    paths,
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  return { props: {} };
};

const ModulePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [lsdTokenSymbol, setLsdTokenSymbol] = useState('');

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: COSMOS_CREATION_STEPS,
        activedIndex: 5,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (router.isReady) {
      if (router.query.poolAddr && typeof router.query.poolAddr === 'string') {
        (async () => {
          try {
            const stakeManagerClient = await getStakeManagerClient();
            const poolInfo = await stakeManagerClient.queryPoolInfo({
              pool_addr: router.query.poolAddr as string,
            });

            // console.log({ poolInfo });

            const wasmClient = await getNeutronWasmClient();
            const lsdTokenClient = new LsdToken.Client(
              wasmClient,
              poolInfo.lsd_token
            );
            const tokenInfo = await lsdTokenClient.queryTokenInfo();
            // console.log({ tokenInfo });
            if (tokenInfo) {
              setLsdTokenSymbol(tokenInfo.symbol);
            }
          } catch {}
        })();
      }
    }
  }, [router]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="my-[.36rem] mr-[.56rem]">
        <ModuleDashboard
          eco={AppEco.Cosmos}
          lsdTokenName={lsdTokenSymbol}
          lsdTokenAddress={router.query.poolAddr as string}
        />
      </div>
    </div>
  );
};

export default ModulePage;

import classNames from 'classnames';
import { useAppSelector } from 'hooks/common';
import { AppEco } from 'interfaces/common';
import Image from 'next/image';
import EcoCosmosImg from 'public/images/eco/cosmos.svg';
import EcoEthImg from 'public/images/eco/eth.png';
import EcoEvmImg from 'public/images/eco/evm.png';
import EcoLrtImg from 'public/images/eco/lrt.png';
import EcoSolanaImg from 'public/images/eco/solana.png';
import ArrowUpImg from 'public/images/eco_arrow_up.svg';
import { RootState } from 'redux/store';

interface Props {
  active: boolean;
}

export const EcoSelectorBtn = ({ active }: Props) => {
  const { appEco } = useAppSelector((state: RootState) => {
    return {
      appEco: state.app.appEco,
    };
  });

  return (
    <div
      className={classNames(
        'cursor-pointer relative w-[3.68rem] h-[.56rem] rounded-[.28rem] flex items-center justify-center',
        'border border-[#222C3C80] hover:border-[#222C3C]'
        // active
        //   ? 'text-text1 bg-transparent border-[.01rem] border-text1'
        //   : 'text-white bg-text1 border-none'
      )}
    >
      {!appEco ? (
        <div
          className={classNames(
            'w-[3.68rem] h-[.56rem] text-[.16rem] font-[600] flex justify-center items-center',
            'text-text1'
          )}
        >
          Choose ECO
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="relative w-[.28rem] h-[.28rem]">
            <Image
              src={
                appEco === AppEco.Cosmos
                  ? EcoCosmosImg
                  : appEco === AppEco.Lrt
                  ? EcoLrtImg
                  : appEco === AppEco.Evm
                  ? EcoEvmImg
                  : appEco === AppEco.Sol
                  ? EcoSolanaImg
                  : EcoEthImg
              }
              fill
              alt="eth"
            />
          </div>
          <div
            className={classNames(
              'ml-[.12rem] text-[.16rem] ',
              active ? 'text-text1' : 'text-text1'
            )}
          >
            {appEco === AppEco.Lrt ? 'Eigenlayer LRT' : appEco}
          </div>
        </div>
      )}

      <div
        className={classNames(
          'absolute w-[.15rem] h-[.12rem] right-[.22rem] top-[.22rem]',
          active ? '' : 'rotate-180'
        )}
      >
        <Image src={ArrowUpImg} fill alt="arrow" />
      </div>
    </div>
  );
};

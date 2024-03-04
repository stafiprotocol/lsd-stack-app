import classNames from 'classnames';
import { useAppSelector } from 'hooks/common';
import { AppEco } from 'interfaces/common';
import Image from 'next/image';
import ArrowDownImg from 'public/images/eco_arrow_down.svg';
import ArrowUpImg from 'public/images/eco_arrow_up.svg';
import { RootState } from 'redux/store';
import EcoEthImg from 'public/images/eco/eth.svg';
import EcoCosmosImg from 'public/images/eco/cosmos.svg';
import EcoSelectedImg from 'public/images/eco/selected.svg';

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
        active
          ? 'text-text1 bg-transparent border-[.01rem] border-text1'
          : 'text-white bg-text1 border-none'
      )}
    >
      {!appEco ? (
        <div
          className={classNames(
            'w-[3.68rem] h-[.56rem] text-[.16rem] font-[600] flex justify-center items-center',
            active ? 'text-text1' : 'text-white '
          )}
        >
          Choose ECO
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="relative w-[.28rem] h-[.28rem]">
            <Image
              src={appEco === AppEco.Cosmos ? EcoCosmosImg : EcoEthImg}
              fill
              alt="eth"
            />
          </div>
          <div
            className={classNames(
              'ml-[.12rem] text-[.16rem] text-white',
              active ? 'text-text1' : 'text-white'
            )}
          >
            {appEco}
          </div>
        </div>
      )}

      <div className="absolute w-[.15rem] h-[.12rem] right-[.22rem] top-[.22rem]">
        <Image src={active ? ArrowUpImg : ArrowDownImg} fill alt="arrow" />
      </div>
    </div>
  );
};

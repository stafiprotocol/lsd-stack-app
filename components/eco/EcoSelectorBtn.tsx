import classNames from 'classnames';
import Image from 'next/image';
import ArrowDownImg from 'public/images/eco_arrow_down.svg';
import ArrowUpImg from 'public/images/eco_arrow_up.svg';

interface Props {
  active: boolean;
}

export const EcoSelectorBtn = ({ active }: Props) => {
  return (
    <div className="cursor-pointer relative w-[3.68rem] h-[.56rem]">
      <div
        className={classNames(
          active
            ? 'text-text1 bg-transparent border-[.01rem] border-text1'
            : 'text-white bg-text1 border-none',
          'w-[3.68rem] h-[.56rem] rounded-[.28rem] text-[.16rem] font-[600] text-center flex justify-center items-center'
        )}
      >
        Choose ECO
      </div>

      <div className="absolute w-[.15rem] h-[.12rem] right-[.22rem] top-[.22rem]">
        <Image src={active ? ArrowUpImg : ArrowDownImg} fill alt="arrow" />
      </div>
    </div>
  );
};

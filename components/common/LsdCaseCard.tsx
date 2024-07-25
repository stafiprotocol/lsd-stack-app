import classNames from 'classnames';
import { robotoBold } from 'config/font';
import Image from 'next/image';
import arrowTrImg from 'public/images/arrow_tr.svg';
import { openLink } from 'utils/commonUtils';
import TipImg from 'public/images/tooltip.svg';
import { Tooltip } from '@mui/material';
import { Icomoon } from 'components/icon/Icomoon';
import Link from 'next/link';
import { getDocHost } from 'config/common';

interface LsdCaseCardProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export const LsdCaseCard = (props: LsdCaseCardProps) => {
  const { title, text, url, className } = props;

  return (
    <div
      className={classNames(
        'group min-w-[5rem] w-[5rem] px-[.3rem] pt-[.24rem] py-[.32rem] rounded-[.32rem] border  flex justify-between',
        'cursor-pointer border-[#000000] hover:border-[#00000000] hover:bg-[#222C3C]',
        className || ''
      )}
      onClick={() => {
        if (url) {
          openLink(url);
        }
      }}
    >
      <div className={classNames('ml-[.12rem] mr-[.12rem] self-stretch')}>
        <div
          className={classNames(
            ' text-[.24rem] text-text1 group-hover:text-[#FFFFFF]',
            robotoBold.className
          )}
        >
          {title}
        </div>

        <div
          className={classNames(
            'mt-[.32rem] text-[.14rem] text-[#222C3C99] group-hover:text-[#FFFFFF99]'
          )}
        >
          {text}
        </div>
      </div>

      <div
        className={classNames(
          'min-w-[.38rem] w-[.38rem] h-[.38rem] rounded-full p-[.1rem] border border-[#000000]',
          'group-hover:bg-[#C9E3FD] group-hover:border-[#00000000]'
        )}
      >
        <div className="w-full h-full relative">
          <Image src={arrowTrImg} layout="fill" alt="icon" />
        </div>
      </div>
    </div>
  );
};

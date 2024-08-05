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
  icon: any;
  text: string;
  url?: string;
  className?: string;
  isComing?: boolean;
  isKarak?: boolean;
  isBlank?: boolean;
}

export const LsdCaseCardV2 = (props: LsdCaseCardProps) => {
  const { icon, text, url, className, isComing, isKarak, isBlank } = props;

  return (
    <Link href={url || ''} target={isBlank ? '_blank' : '_self'}>
      <div
        className={classNames(
          'group  flex flex-col items-center',
          isComing ? 'cursor-default ' : 'cursor-pointer ',
          isComing ? 'opacity-50' : '',
          className || ''
        )}
      >
        <div
          className={classNames(
            'border  p-[.1rem] w-[.54rem] h-[.54rem] rounded-full border-[#00000080]',
            isComing ? '' : 'group-hover:translate-y-[-.08rem]'
          )}
          style={{
            transition: 'all .25s ease-out',
          }}
        >
          <div className="w-full h-full relative">
            <Image src={icon} layout="fill" alt="icon" />
          </div>
        </div>

        <div
          className={classNames(
            'text-[.14rem] mt-[.1rem]',
            isComing ? 'text-text1' : 'text-text1'
          )}
        >
          {text}
        </div>
      </div>
    </Link>
  );
};

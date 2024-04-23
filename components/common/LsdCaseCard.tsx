import classNames from 'classnames';
import { robotoBold } from 'config/font';
import Image from 'next/image';
import arrowTrImg from 'public/images/arrow_tr.svg';
import { openLink } from 'utils/commonUtils';

interface LsdCaseCardProps {
  icon: any;
  text: string;
  url: string;
  className?: string;
}

export const LsdCaseCard = (props: LsdCaseCardProps) => {
  const { icon, text, url, className } = props;

  return (
    <div
      className={classNames(
        'cursor-pointer group min-w-[2.55rem] w-[2.55rem] h-[1.78rem] rounded-[.12rem] border border-[#000000] hover:border-[#00000000] hover:bg-[#E8EEFD] flex flex-col items-center',
        className || ''
      )}
      onClick={() => {
        openLink(url);
      }}
    >
      <div className="mt-[.1rem] w-[1.6rem] h-[1.08rem] relative">
        <Image src={icon} layout="fill" alt="icon" />
      </div>

      <div className="ml-[.12rem] mr-[.12rem] self-stretch mt-[.1rem] flex items-center justify-between">
        <div
          className={classNames(
            'text-text1 text-[.2rem]',
            robotoBold.className
          )}
        >
          {text}
        </div>

        <div className="w-[.38rem] h-[.38rem] rounded-full p-[.1rem] group-hover:bg-[#ffffff]">
          <div className="w-full h-full relative">
            <Image src={arrowTrImg} layout="fill" alt="icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

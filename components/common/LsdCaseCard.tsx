import classNames from 'classnames';
import { robotoBold } from 'config/font';
import Image from 'next/image';
import arrowTrImg from 'public/images/arrow_tr.svg';
import { openLink } from 'utils/commonUtils';

interface LsdCaseCardProps {
  icon: any;
  text: string;
  url?: string;
  className?: string;
  isComing?: boolean;
}

export const LsdCaseCard = (props: LsdCaseCardProps) => {
  const { icon, text, url, className, isComing } = props;

  return (
    <div
      className={classNames(
        'group min-w-[2.55rem] w-[2.55rem] h-[1.78rem] rounded-[.12rem] border border-[#000000] flex flex-col items-center',
        isComing
          ? 'cursor-default'
          : 'cursor-pointer hover:border-[#00000000] hover:bg-[#E8EEFD] ',
        className || ''
      )}
      onClick={() => {
        if (!isComing && url) {
          openLink(url);
        }
      }}
    >
      <div className="mt-[.1rem] w-[1.6rem] h-[1.08rem] relative">
        <Image src={icon} layout="fill" alt="icon" />
      </div>

      <div
        className={classNames(
          'ml-[.12rem] mr-[.12rem] self-stretch mt-[.1rem] flex items-center ',
          isComing ? 'justify-center' : 'justify-between'
        )}
      >
        <div
          className={classNames(
            ' text-[.2rem]',
            robotoBold.className,
            isComing ? 'text-text2 h-[.38rem] flex items-center' : 'text-text1'
          )}
        >
          {isComing ? 'COMING SOON' : text}
        </div>

        {!isComing && (
          <div className="w-[.38rem] h-[.38rem] rounded-full p-[.1rem] group-hover:bg-[#ffffff]">
            <div className="w-full h-full relative">
              <Image src={arrowTrImg} layout="fill" alt="icon" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

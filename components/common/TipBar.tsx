import Image from 'next/image';
import TipImg from 'public/images/tip.svg';
import TipYellowImg from 'public/images/tip_yellow.svg';
import LinkArrowImg from 'public/images/link_arrow.svg';
import classNames from 'classnames';

interface Props {
  isWarning?: boolean;
  link?: string;
  content: JSX.Element | string;
  className?: string;
}

export const TipBar = ({ isWarning, link, content, className }: Props) => {
  return (
    <a
      className={classNames(
        'bg-bg3 rounded-[.12rem] flex items-center py-[.18rem] px-[.12rem] justify-between',
        className || ''
      )}
      target="_blank"
      href={link}
    >
      <div className="flex items-center flex-1">
        <div className="relative w-[.2rem] h-[.2rem] min-w-[.2rem]">
          <Image
            src={isWarning ? TipYellowImg : TipImg}
            alt="tip"
            layout="fill"
          />
        </div>

        <div className="text-[.14rem] leading-[.21rem] text-text2 ml-[.06rem]">
          {content}
        </div>
      </div>

      <div
        className={classNames(
          'relative h-[.1116rem] w-[.07rem] min-w-[.07rem]',
          link ? '' : 'invisible'
        )}
      >
        <Image src={LinkArrowImg} alt="link" layout="fill" />
      </div>
    </a>
  );
};

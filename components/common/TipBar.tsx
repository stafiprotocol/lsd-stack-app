import Image from 'next/image';
import TipImg from 'public/images/tip.svg';
import TipYellowImg from 'public/images/tip_yellow.svg';
import LinkArrowImg from 'public/images/link_arrow.svg';

interface Props {
  isWarning?: boolean;
  link: string;
  content: JSX.Element | string;
}

export const TipBar = ({ isWarning, link, content }: Props) => {
  return (
    <a
      className="bg-bg3 rounded-[.12rem] flex items-center py-[.18rem] px-[.12rem]"
      target="_blank"
      href={link}
    >
      <div className="relative w-[.2rem] h-[.2rem]">
        <Image
          src={isWarning ? TipYellowImg : TipImg}
          alt="tip"
          layout="fill"
        />
      </div>

      <div className="text-[.14rem] leading-[.21rem] text-text2 ml-[.06rem]">
        {content}
      </div>

      <div className="ml-auto relative h-[.1116rem] w-[.0656rem]">
        <Image src={LinkArrowImg} alt="link" layout="fill" />
      </div>
    </a>
  );
};
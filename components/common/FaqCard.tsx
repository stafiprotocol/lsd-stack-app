import Image from 'next/image';
import ExternalLinkImg from 'public/images/external_link.svg';
import { PropsWithChildren, ReactNode } from 'react';

interface Props {
  title: string;
  link: string;
}

export const FaqCard = ({
  title,
  link,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <div className="ml-[.87rem] w-[4.29rem]">
      <div className="flex items-center gap-[.12rem]">
        <a
          className="text-[.24rem] text-text1 leading-[.36rem] underline"
          href={link}
          target="_blank"
        >
          {title}
        </a>
        <div className="relative w-[.12rem] h-[.12rem]">
          <Image src={ExternalLinkImg} alt="link" layout="fill" />
        </div>
      </div>

      <div className="mt-[.15rem] bg-color-bg3 rounded-[.12rem] py-[.24rem] px-[.24rem] text-[.16rem] leading-[.32rem] text-text2">
        {children}
      </div>
    </div>
  );
};

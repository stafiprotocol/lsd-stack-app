import classNames from 'classnames';
import { robotoBold } from 'config/font';
import { PropsWithChildren } from 'react';

interface Props {
  title: string;
}

export const FormCard = ({ title, children }: PropsWithChildren<Props>) => {
  return (
    <div className="bg-[#FFFFFF80] border-[.01rem] border-white rounded-[.2rem] w-[6.19rem] px-[.37rem]">
      <div
        className={classNames(
          robotoBold.className,
          'text-[.28rem] leading-[.42rem] text-text1 text-center mt-[.24rem]'
        )}
      >
        {title}
      </div>

      {children}
    </div>
  );
};

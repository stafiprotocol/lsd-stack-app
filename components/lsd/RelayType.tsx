import classNames from 'classnames';
import { CustomButton } from 'components/common/CustomButton';
import { ReactPropTypes } from 'react';

interface Props {
  title: string;
  desc: JSX.Element | string;
  onChoose: () => void;
}

export const RelayType = ({ title, desc, onChoose }: Props) => {
  return (
    <div
      className={classNames(
        'w-[2.4rem] flex flex-col items-center justify-between bg-bgPage rounded-[.3rem] h-[2.38rem]'
      )}
    >
      <div className="flex flex-col items-center px-[.16rem]">
        <div className="text-[.2rem] leading-[.2rem] font-[700] text-text1 text-center mt-[.24rem]">
          {title}
        </div>
        <div className="text-[.16rem] leading-[.24rem] text-text2 mt-[.16rem] text-center">
          {desc}
        </div>
      </div>
      <div className="mb-[.24rem]">
        <CustomButton width="1.89rem" height=".42rem" onClick={onChoose}>
          Choose
        </CustomButton>
      </div>
    </div>
  );
};

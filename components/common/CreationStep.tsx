import classNames from 'classnames';
import { LsaasSidebar } from 'components/modal/LsaasSidebar';
import { roboto, robotoBold } from 'config/font';

interface CreationStepProps {
  steps: string[];
  activedIndex: number;
}

export const CreationStep = ({ steps, activedIndex }: CreationStepProps) => {
  return (
    <div className="flex">
      <div className="flex  items-center relative">
        {steps.map((step: string, index: number) => (
          <Step
            key={index}
            actived={activedIndex === index}
            label={step}
            index={index}
          />
        ))}

        <div className="z-[-1] h-[.01rem] absolute top-[.21rem] left-[10%] right-[10%] bg-bg1Dark" />
      </div>
    </div>
  );
};

interface StepProps {
  actived: boolean;
  label: string;
  index: number;
}

const Step = ({ actived, label, index }: StepProps) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center w-[1.8rem]">
        <div
          className={classNames(
            'w-[.42rem] h-[.42rem] rounded text-[.2rem] leading-[.3rem] flex justify-center items-center text-center',
            actived
              ? 'bg-stepActived text-text1'
              : 'bg-stepInactived text-text2'
          )}
        >
          {index}
        </div>

        <div
          className={classNames(
            'text-[.16rem] leading-[.24rem]',
            actived ? 'text-text1' : 'text-text2',
            actived ? robotoBold.className : roboto.className
          )}
        >
          {label}
        </div>
      </div>{' '}
    </div>
  );
};

import classNames from 'classnames';

interface CreationStepProps {
  steps: string[];
  activedIndex: number;
}

export const CreationStep = ({ steps, activedIndex }: CreationStepProps) => {
  return (
    <div className="flex">
      <div className="flex gap-[.8rem] items-center relative">
        {steps.map((step: string, index: number) => (
          <Step
            key={index}
            actived={activedIndex === index}
            label={step}
            index={index}
          />
        ))}
        <div className="z-[-1] h-[.01rem] w-[90%] absolute top-[.21rem] left-[5%] bg-bg1Dark" />
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
    <div className="flex flex-col items-center gap-[.12rem]">
      <div
        className={classNames(
          'w-[.42rem] h-[.42rem] rounded text-[.2rem] leading-[.3rem] flex justify-center items-center text-center',
          actived ? 'bg-stepActived text-text1' : 'bg-stepInactived text-text2'
        )}
      >
        {index + 1}
      </div>

      <div
        className={classNames(
          'text-[.16rem] leading-[.24rem]',
          actived ? 'text-text1 font-[700]' : 'text-text2 font-[400]'
        )}
      >
        {label}
      </div>
    </div>
  );
};

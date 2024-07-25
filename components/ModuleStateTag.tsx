import classNames from 'classnames';

interface Props {
  state: 'running' | 'paused' | 'not set';
  className?: string;
}

export const ModuleStateTag = (props: Props) => {
  const { className } = props;
  if (props.state === 'running') {
    return (
      <div
        className={classNames(
          'flex items-center justify-center bg-[#80CAFF80] rounded-[.06rem] h-[.26rem] px-[.06rem] text-text1 text-[.12rem]',
          className || ''
        )}
      >
        Running
      </div>
    );
  } else if (props.state === 'paused') {
    return (
      <div
        className={classNames(
          'flex items-center justify-center bg-[#FFE58BCC] rounded-[.06rem] h-[.26rem] px-[.06rem] text-text1 text-[.12rem]',
          className || ''
        )}
      >
        Paused
      </div>
    );
  }
  return (
    <div
      className={classNames(
        'flex items-center justify-center bg-[#DEE6F7] rounded-[.06rem] h-[.26rem] px-[.06rem] text-text1 text-[.12rem]',
        className || ''
      )}
    >
      Not Set
    </div>
  );
};

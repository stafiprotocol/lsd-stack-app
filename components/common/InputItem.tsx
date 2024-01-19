import NumArrowUpImg from 'public/images/num_arrow_up.svg';
import NumArrowDownImg from 'public/images/num_arrow_down.svg';
import Image from 'next/image';
import classNames from 'classnames';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  isNumber?: boolean;
  min?: number;
}

export const InputItem = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  isNumber,
}: Props) => {
  const onChangeValue = (v: string) => {
    if (isNumber) {
      if (isNaN(Number(v))) return;
    }
    onChange(v);
  };

  const onAddNum = () => {
    if (isNaN(Number(value))) {
      onChange('1');
    } else {
      onChange(Number(value) + 1 + '');
    }
  };

  const onMinusNum = () => {
    if (isNaN(Number(value)) || Number(value) === 0) {
      onChange('0');
    } else {
      onChange(Number(value) - 1 + '');
    }
  };

  return (
    <div className="flex justify-between items-center h-[.5rem]">
      <div className="text-[.16rem] leading-[.18rem] font-[700] text-text2 w-[1.2rem]">
        {label}
      </div>

      <div className="w-[4.23rem] h-[.5rem] relative">
        <input
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={placeholder}
          disabled={!!disabled}
          className={classNames(
            'w-full outline-none h-[.5rem] rounded-[.16rem] placeholder:text-text2/50 px-[.24rem] py-[.16rem] text-text2',
            disabled
              ? 'bg-bgPage/50'
              : 'border-[#6C86AD4D] bg-transparent border-solid border-[.01rem]'
          )}
        />
        {isNumber && (
          <div className="absolute top-[.06rem] right-[.2rem] flex flex-col items-center gap-[.04rem] z-10">
            <div
              className="w-[.16rem] h-[.16rem] rounded-[.04rem] cursor-pointer bg-divider2 flex justify-center items-center"
              onClick={onAddNum}
            >
              <div className="relative w-[.1rem] h-[.08rem]">
                <Image src={NumArrowUpImg} alt="add" layout="fill" />
              </div>
            </div>
            <div
              className="w-[.16rem] h-[.16rem] rounded-[.04rem] cursor-pointer bg-divider2 flex justify-center items-center"
              onClick={onMinusNum}
            >
              <div className="relative w-[.1rem] h-[.08rem]">
                <Image src={NumArrowDownImg} alt="minus" layout="fill" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

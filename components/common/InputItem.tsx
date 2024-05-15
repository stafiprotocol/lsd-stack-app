import NumArrowUpImg from 'public/images/num_arrow_up.svg';
import NumArrowDownImg from 'public/images/num_arrow_down.svg';
import Image from 'next/image';
import classNames from 'classnames';
import { robotoBold } from 'config/font';

interface Props {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  isNumber?: boolean;
  showAddMinusButton?: boolean;
  min?: number;
  max?: number;
  className?: string;
  suffix?: string;
  isInteger?: boolean;
}

export const InputItem = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  isNumber,
  showAddMinusButton,
  className,
  suffix,
  min,
  max,
  isInteger,
}: Props) => {
  const onChangeValue = (v: string) => {
    if (isNumber) {
      if (isNaN(Number(v))) return;
    }
    onChange(v);
  };

  const onAddNum = () => {
    if (Number(value) + 1 > Number(max)) {
      return;
    }
    if (isNaN(Number(value))) {
      onChange('1');
    } else {
      onChange(Number(value) + 1 + '');
    }
  };

  const onMinusNum = () => {
    if (Number(value) - 1 < Number(min)) {
      return;
    }
    if (isNaN(Number(value)) || Number(value) === 0) {
      onChange('0');
    } else {
      onChange(Number(value) - 1 + '');
    }
  };

  return (
    <div
      className={classNames(
        'flex justify-between items-center h-[.5rem]',
        className || ''
      )}
    >
      <div
        className={classNames(
          robotoBold.className,
          'text-[.16rem] leading-[.18rem] text-text2 w-[1.4rem] break-words'
        )}
      >
        {label}
      </div>

      <div className="flex-1 w-full h-[.5rem] relative">
        <input
          value={value}
          onChange={(e) => {
            let value = e.target.value;
            if (isInteger) {
              value = value.replace(/[^\d]/g, '');
              // value = value.replace(/^\./g, "");
              value = value.replace(/\.{2,}/g, '.');
              value = value
                .replace('.', '$#$')
                .replace(/\./g, '')
                .replace('$#$', '.');
              const regexTemplate = /^(-)*(\d*)\.*$/;
              value = value.replace(regexTemplate, '$1$2');
            } else if (isNumber) {
              value = value.replace(/[^\d.]/g, '');
              // value = value.replace(/^\./g, "");
              value = value.replace(/\.{2,}/g, '.');
              value = value
                .replace('.', '$#$')
                .replace(/\./g, '')
                .replace('$#$', '.');
              const regexTemplate = /^(-)*(\d*)\.(\d\d\d\d\d\d).*$/;
              value = value.replace(regexTemplate, '$1$2.$3');
            }
            onChangeValue(value);
          }}
          placeholder={placeholder}
          disabled={!!disabled}
          className={classNames(
            'w-full outline-none h-[.5rem] rounded-[.16rem] placeholder:text-text2/50 px-[.24rem] py-[.16rem] text-text2',
            disabled
              ? 'bg-bgPage/50'
              : 'border-[#6C86AD4D] bg-transparent border-solid border-[.01rem]'
          )}
        />

        {showAddMinusButton && (
          <div className="absolute top-[.06rem] right-[.2rem] flex flex-col items-center gap-[.04rem] z-10">
            <div
              className="w-[.16rem] h-[.16rem] rounded-[.04rem] cursor-pointer bg-divider2 flex justify-center items-center"
              onClick={onAddNum}
            >
              <div
                className={classNames(
                  'relative w-[.1rem] h-[.08rem]',
                  max !== undefined && Number(value) + 1 > Number(max)
                    ? 'opacity-50'
                    : ''
                )}
              >
                <Image src={NumArrowUpImg} alt="add" layout="fill" />
              </div>
            </div>

            <div
              className="w-[.16rem] h-[.16rem] rounded-[.04rem] cursor-pointer bg-divider2 flex justify-center items-center"
              onClick={onMinusNum}
            >
              <div
                className={classNames(
                  'relative w-[.1rem] h-[.08rem]',
                  min !== undefined && Number(value) - 1 < Number(min)
                    ? 'opacity-50'
                    : ''
                )}
              >
                <Image src={NumArrowDownImg} alt="minus" layout="fill" />
              </div>
            </div>
          </div>
        )}

        {suffix && (
          <div className="absolute top-[.18rem] right-[.2rem] flex flex-col items-center gap-[.04rem] z-10">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
};

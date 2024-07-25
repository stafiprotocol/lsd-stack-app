import classNames from 'classnames';
import Image from 'next/image';
import { getEcoTokenIcon, getModuleIcon } from 'utils/iconUtils';
import { CustomButton } from './common/CustomButton';

export const EthModule = () => {
  const list = [1, 2, 3, 4, 5];

  return (
    <div>
      <div className="mt-[.24rem] bg-color-bg2 border-[0.01rem] border-color-border1 rounded-[.3rem]">
        <div
          className="h-[.7rem] grid items-center font-[500]"
          style={{
            gridTemplateColumns: '22% 22% 10% 46%',
          }}
        >
          <div className="pl-[.5rem] flex items-center justify-start text-[.16rem] text-color-text2">
            Token Name
          </div>

          <div className="flex items-center justify-start text-[.16rem] text-color-text2">
            Module Name
          </div>

          <div className="flex items-center justify-start text-[.16rem] text-color-text2">
            Status
          </div>

          <div className="flex items-center justify-start text-[.16rem] text-color-text2"></div>
        </div>

        {list.map((item, index) => (
          <EthModuleItem key={index} index={index} />
        ))}
      </div>
    </div>
  );
};

interface EthModuleItemProps {
  index: number;
}

const EthModuleItem = (props: EthModuleItemProps) => {
  const { index } = props;

  return (
    <div
      className={classNames(
        'h-[.74rem] grid items-center font-[500]',
        index % 2 === 0 ? 'bg-bgPage/50 dark:bg-bgPageDark/50' : ''
      )}
      style={{
        gridTemplateColumns: '22% 22% 10% 46%',
      }}
    >
      <div className="pl-[.28rem] flex items-center justify-start text-[.16rem] text-color-text1">
        <div
          className="cursor-pointer flex-1 h-[.42rem] flex items-center rounded-[.6rem] "
          onClick={() => {}}
        >
          <div className="flex items-center">
            <div className="w-[.34rem] h-[.34rem] min-w-[.34rem] relative ml-[.04rem]">
              <Image src={getEcoTokenIcon(null)} alt="logo" layout="fill" />
            </div>

            <div className="ml-[.16rem] text-[.16rem] text-color-text1">
              rETH-ETH
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        <div className="w-[.34rem] h-[.34rem] min-w-[.34rem] relative mr-[.16rem]">
          <Image src={getModuleIcon(null)} alt="logo" layout="fill" />
        </div>
        Validator Service
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        <div
          className={classNames(
            'text-text1 text-[.12rem] w-[.65rem] h-[.26rem] flex items-center justify-center rounded-[.06rem]',
            'bg-[#80CAFF80]'
          )}
        >
          Running
        </div>
      </div>

      <div className="flex items-center justify-start text-[.16rem] text-color-text1">
        <CustomButton type="primary" width="1.3rem">
          Edit
        </CustomButton>

        <CustomButton type="stroke" width="1.3rem" className="ml-[.24rem]">
          Toturial
        </CustomButton>

        <CustomButton type="stroke" width="1.3rem" className="ml-[.24rem]">
          Turn off
        </CustomButton>
      </div>
    </div>
  );
};

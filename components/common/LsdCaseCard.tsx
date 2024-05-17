import classNames from 'classnames';
import { robotoBold } from 'config/font';
import Image from 'next/image';
import arrowTrImg from 'public/images/arrow_tr.svg';
import { openLink } from 'utils/commonUtils';
import TipImg from 'public/images/tooltip.svg';
import { Tooltip } from '@mui/material';
import { Icomoon } from 'components/icon/Icomoon';
import Link from 'next/link';
import { getDocHost } from 'config/common';

interface LsdCaseCardProps {
  icon: any;
  text: string;
  url?: string;
  className?: string;
  isComing?: boolean;
  isKarak?: boolean;
}

export const LsdCaseCard = (props: LsdCaseCardProps) => {
  const { icon, text, url, className, isComing, isKarak } = props;

  return (
    <div
      className={classNames(
        'group min-w-[2.55rem] w-[2.55rem] h-[1.78rem] rounded-[.12rem] border  flex flex-col items-center',
        isComing
          ? 'cursor-default border-[#00000070]'
          : 'cursor-pointer border-[#000000] hover:border-[#00000000] hover:bg-[#E8EEFD] ',
        className || ''
      )}
      onClick={() => {
        if (!isComing && url) {
          openLink(url);
        }
      }}
    >
      <div className="mt-[.1rem] w-[1.6rem] h-[1.08rem] relative">
        <Image src={icon} layout="fill" alt="icon" />
      </div>

      <div
        className={classNames(
          'ml-[.12rem] mr-[.12rem] self-stretch mt-[.1rem] flex items-center',
          isComing ? 'justify-between' : 'justify-between'
        )}
      >
        {isKarak ? (
          <Tooltip
            title={
              <div className="">
                <div className="text-[#222C3B] text-[.16rem] text-center">
                  Internal product testing is complete. We&apos;re now standing
                  by for the Karak official testnet launch
                </div>

                <Link href={getDocHost()} target="_blank">
                  <div className="mt-[.1rem] flex item-center cursor-pointer justify-center">
                    <div
                      className={classNames(
                        'text-link mr-[.06rem] text-[.14rem]',
                        robotoBold.className
                      )}
                    >
                      Learn More
                    </div>

                    <div className="flex items-center">
                      <Icomoon icon="share" size=".12rem" color="#5A5DE0" />
                    </div>
                  </div>
                </Link>
              </div>
            }
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  width: '2.4rem',
                  color: '#6C86AD',
                  background: '#ffffff80',
                  border: '0.01rem solid #FFFFFF',
                  backdropFilter: 'blur(.4rem)',
                  borderRadius: '.3rem',
                  lineHeight: 1.4,
                  padding: '.12rem .16rem',
                },
              },
            }}
            sx={{
              fontSize: '.12rem',
              marginBottom: 0,
              '& .MuiTooltip-popover': {
                marginBottom: 0,
              },
            }}
            PopperProps={{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [60, -15],
                  },
                },
              ],
            }}
          >
            <div className="flex items-center">
              <div
                className={classNames(
                  ' text-[.2rem]',
                  robotoBold.className,
                  isComing
                    ? 'text-text1 h-[.38rem] flex items-center opacity-50'
                    : 'text-text1'
                )}
              >
                {text}
              </div>

              <div className="flex items-center ml-[.04rem] w-[.14rem] h-[.14rem] relative">
                <Image src={TipImg} layout="fill" alt="icon" />
              </div>
            </div>
          </Tooltip>
        ) : (
          <div
            className={classNames(
              ' text-[.2rem]',
              robotoBold.className,
              isComing
                ? 'text-text1 h-[.38rem] flex items-center opacity-50'
                : 'text-text1'
            )}
          >
            {text}
          </div>
        )}

        {/* {isComing ? (
          <div className="opacity-50 ml-[.06rem] w-[.38rem] flex items-center justify-center py-[.02rem] rounded-[.04rem] bg-text1 text-blue text-[.12rem]">
            soon
          </div>
        ) : ( */}
        <div
          className={classNames(
            'w-[.38rem] h-[.38rem] rounded-full p-[.1rem] ',
            isComing ? 'opacity-50' : 'group-hover:bg-[#ffffff]'
          )}
        >
          <div className="w-full h-full relative">
            <Image src={arrowTrImg} layout="fill" alt="icon" />
          </div>
        </div>
        {/* )} */}
      </div>
    </div>
  );
};

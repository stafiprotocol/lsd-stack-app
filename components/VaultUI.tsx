import classNames from 'classnames';
import { robotoBold, robotoSemiBold } from 'config/font';
import Image from 'next/image';
import Link from 'next/link';
import vault1Img from 'public/images/vault1.svg';
import { openLink } from 'utils/commonUtils';

export const VaultUI = () => {
  return (
    <div className="flex-1 bg-blue flex flex-col justify-center pb-[.6rem]">
      <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto ">
        <div className="flex gap-[.12rem] pt-[.67rem] justify-center">
          <div className={classNames('text-[#222c3c]')}>
            <div
              className={classNames(
                robotoBold.className,
                'text-[.56rem] uppercase leading-[111%] w-[5.64rem]'
              )}
            >
              One Vault, Infinite Possibilities
            </div>
            <div className="text-[.16rem] leading-[.24rem] w-[5.02rem] mt-[.34rem] capitalize tracking-normal">
              Revolutionary infrastructure module designed specifically for
              non-PoS tokens, dApps, and appchains. Built entirely at the
              contract layer, enabling any project to tap into the power of
              staking rewards, liquidity, and composability — without validators
              or consensus dependencies.
            </div>
            <div className="mt-[.32rem] flex items-center">
              <div className="flex h-[.56rem] items-stretch rounded-[.56rem] border border-[#222C3C80] hover:border-[#222C3C] active:border-[#222C3C80]">
                <div
                  className={classNames(
                    robotoSemiBold.className,
                    ' px-[.3rem] flex items-center cursor-pointer text-text1'
                  )}
                  onClick={() => {
                    openLink('https://docs.stafi.io/lsaas');
                  }}
                >
                  Contact Us
                </div>
              </div>

              <Link href="https://stafi.io/vault" target="_blank">
                <div
                  className={classNames(
                    robotoSemiBold.className,
                    'mx-[.3rem] flex items-center cursor-pointer text-text1'
                  )}
                >
                  Learn More
                </div>
              </Link>
            </div>
          </div>

          <div className="relative w-[6.6092rem] h-[4.356rem]">
            <Image src={vault1Img} alt="vault1" fill />
          </div>
        </div>
      </div>
    </div>
  );
};

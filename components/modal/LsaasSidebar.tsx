import classNames from 'classnames';
import { Icomoon } from 'components/icon/Icomoon';
import {
  getCosmosStackAppUrl,
  getEthStackAppUrl,
  getLrtCaseUrl,
} from 'config/eth/env';
import { robotoBold } from 'config/font';
import Image from 'next/image';
import { useRouter } from 'next/router';
import spaceship from 'public/images/spaceship.svg';
import { openLink } from 'utils/commonUtils';

export const LsaasSidebar = () => {
  const router = useRouter();

  return (
    <div
      className={classNames(
        'rounded-l-[.16rem] h-[.64rem] w-[2.7rem] flex items-center cursor-pointer border-solid border-[0.01rem] border-[#222C3C1A] dark:border-[#6C86AD80]'
      )}
      style={{
        zIndex: 10,
      }}
      onClick={() => {
        if (router.pathname.includes('cosmos')) {
          openLink(getCosmosStackAppUrl());
        } else if (router.pathname.includes('eth')) {
          openLink(getEthStackAppUrl());
        } else if (router.pathname.includes('lrt')) {
          openLink(getLrtCaseUrl());
        }
      }}
    >
      <div className={classNames('ml-[.02rem] w-[.6rem] h-[.5rem] relative')}>
        <Image src={spaceship} layout="fill" alt="loading" />
      </div>

      <div>
        <div className="flex items-center">
          <div
            className={classNames(
              'text-[.16rem] text-text1 font-[700]',
              robotoBold.className
            )}
          >
            Testnet Showcase
          </div>

          <span className="min-w-[.15rem] min-h-[.15rem] ml-[.08rem]">
            <Icomoon icon="share" size=".12rem" />
          </span>
        </div>

        <div
          className={classNames('mt-[.06rem] text-[.12rem] text-color-text2')}
        >
          Try the LSaaS testnet now!
        </div>
      </div>
    </div>
  );
};

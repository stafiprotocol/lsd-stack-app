import { Popover } from '@mui/material';
import classNames from 'classnames';
import { NeutronDashboard } from 'components/NeutronDashboard';
import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { TipBar } from 'components/common/TipBar';
import { Icomoon } from 'components/icon/Icomoon';
import { getDocHost } from 'config/common';
import { neutronChainConfig } from 'config/cosmos/chain';
import { evmLsdTokens } from 'config/evm';
import { EVM_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { useCosmosChainAccount } from 'hooks/useCosmosChainAccount';
import { EvmLsdTokenConfig } from 'interfaces/common';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import empty from 'public/images/empty_bird.svg';
import others from 'public/images/tokens/others.svg';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { connectKeplrAccount } from 'redux/reducers/WalletSlice';
import { openLink } from 'utils/commonUtils';

const CosmosPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const neutronChainAccount = useCosmosChainAccount(neutronChainConfig.chainId);

  const [selectedLsdToken, setSelectedLsdToken] = useState<EvmLsdTokenConfig>();

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'token',
  });

  useEffect(() => {
    if (evmLsdTokens.length > 0) {
      setSelectedLsdToken(evmLsdTokens[0]);
    }
  }, []);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: EVM_CREATION_STEPS,
        activedIndex: 1,
      })
    );
  }, [dispatch]);

  return (
    <div>
      <div
        className="pb-[.56rem]"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) -20.69%, rgba(255, 255, 255, 0.5) 103.45%)',
          boxShadow: '0px 1px 0px #FFFFFF',
        }}
      >
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto pb-[1rem]">
          <div className="flex mt-[.42rem] items-start">
            <FormCard title="Choose Network">
              <>
                <TipBar
                  content={
                    'ATOM Liquid Staking utilizes Neutron infrastructure. Please acknowledge the inherent risks before proceeding.'
                  }
                  isWarning
                  link={`${getDocHost()}/docs/develop_cosmos_lsd/deploy.html#neutron-risks-awareness`}
                  className="mt-[.24rem] hidden"
                />

                <div
                  className="mt-[.48rem] bg-[#DEE6F780] rounded-[.2rem] text-[.14rem] text-text1 flex justify-center items-center text-center h-[.49rem] cursor-pointer"
                  {...bindTrigger(popupState)}
                >
                  {selectedLsdToken?.symbol}
                </div>

                <div
                  className={classNames(
                    'mt-[.57rem]',
                    popupState.isOpen ? 'invisible' : ''
                  )}
                >
                  <CustomButton
                    type="primary"
                    height=".56rem"
                    onClick={() =>
                      router.push(`/evm/${selectedLsdToken?.symbol}`)
                    }
                  >
                    Next
                  </CustomButton>
                </div>

                <div className="text-[.14rem] leading-[.21rem] text-[#6C86AD] mt-[.15rem] text-center mb-[.36rem]">
                  We currently only support SEI. To deploy other LSD, please{' '}
                  <a
                    href="https://discord.com/invite/jB77etn"
                    target="_blank"
                    className="underline"
                  >
                    contact us
                  </a>
                </div>

                <Popover
                  {...bindPopover(popupState)}
                  elevation={0}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  sx={{
                    marginTop: '.12rem',
                    '& .MuiPopover-paper': {
                      background: '#FFFFFF80',
                      borderRadius: '.3rem',
                      border: 'solid 1px #FFFFFF80',
                      width: '5.47rem',
                      paddingLeft: '.16rem',
                      paddingRight: '.16rem',
                    },
                    '& .MuiTypography-root': {},
                    '& .MuiBox-root': {},
                  }}
                >
                  {evmLsdTokens.map((lsdTokenConfig, index) => (
                    <div key={index}>
                      <div
                        key={index}
                        className="h-[.58rem] flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          popupState.close();
                          setSelectedLsdToken(lsdTokenConfig);
                        }}
                      >
                        <div className="flex items-center">
                          <div className="ml-[.16rem] w-[.28rem] h-[.28rem] relative">
                            <Image
                              src={lsdTokenConfig.icon}
                              alt="logo"
                              layout="fill"
                            />
                          </div>

                          <div className="ml-[.12rem] text-[.16rem]">
                            {lsdTokenConfig.symbol}
                          </div>
                        </div>

                        <div className="mr-[.3rem]">
                          {lsdTokenConfig.symbol ===
                          selectedLsdToken?.symbol ? (
                            <Icomoon
                              icon="checked-circle"
                              size=".18rem"
                              color="#5A5DE0"
                            />
                          ) : (
                            <div className="w-[.18rem] h-[.18rem] rounded-full border-solid border-[1px] border-color-border3" />
                          )}
                        </div>
                      </div>

                      <div className="bg-[#E8EFFD] h-[1px] mx-[.3rem]" />
                    </div>
                  ))}

                  <div className="h-[.58rem] flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-[.16rem] w-[.28rem] h-[.28rem] relative">
                        <Image src={others} alt="logo" layout="fill" />
                      </div>

                      <div className="ml-[.16rem] text-[.16rem]">Others</div>
                    </div>

                    <div
                      className="mr-[.3rem] text-[.16rem] text-[#5A5DE0] cursor-pointer"
                      onClick={() => {
                        popupState.close();
                        openLink('https://discord.com/invite/jB77etn');
                      }}
                    >
                      Contact Us
                    </div>
                  </div>
                </Popover>
              </>
            </FormCard>

            <FaqCard
              title="Choose Network"
              link={`${getDocHost()}/docs/develop_cosmos_lsd/getstarted.html`}
            >
              <>
                Neutron Contract:
                <br />
                - Require ICS-27 protocol support on the target chain
                <br />
                - Require trust in Neutron
                <br />
                - Support most chain
                <br />
                - High security implemented
                <br />
                - Ready to use
                <br />
                <br />
                Native Contract:
                <br />
                - Require Native smart contract support on the target chain
                <br />
                - Top-tier security implemented
                <br />- Coming soon
              </>
            </FaqCard>
          </div>
        </div>
      </div>

      <div className="bg-bgPage pt-[.56rem] pb-[1.05rem] hidden">
        <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
          {neutronChainAccount?.bech32Address ? (
            <NeutronDashboard />
          ) : (
            <div className="flex flex-col items-center">
              <div
                className="relative"
                style={{
                  width: '.4rem',
                  height: '.4rem',
                }}
              >
                <Image src={empty} alt="empty" layout="fill" />
              </div>

              <div className="mt-[.16rem] text-[.14rem] text-color-text2">
                Please connect your wallet to view your LSD deploy history
              </div>

              <div className="mt-[.32rem] flex items-center">
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    dispatch(connectKeplrAccount([neutronChainConfig]));
                  }}
                >
                  <CustomButton
                    type="primary"
                    width="1.62rem"
                    className="opacity-50"
                  ></CustomButton>

                  <div className="text-[.16rem] text-text1 absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center">
                    Connect Wallet
                  </div>
                </div>

                <Link href={getDocHost()} target="_blank">
                  <CustomButton
                    type="stroke"
                    width="1.62rem"
                    className="ml-[.32rem]"
                  >
                    View Doc
                  </CustomButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CosmosPage;

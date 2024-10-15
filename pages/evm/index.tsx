import { Popover } from '@mui/material';
import classNames from 'classnames';
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
import { useRouter } from 'next/router';
import ArrowDownImg from 'public/images/arrow_down_gray.svg';
import others from 'public/images/tokens/others.svg';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
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
                  content={'FIXME'}
                  isWarning
                  link={`${getDocHost()}/fixme`}
                  className="mt-[.24rem] hidden"
                />

                <div
                  className="relative mt-[.48rem] border border-[#6C86AD4D] rounded-[.2rem] text-[.14rem] text-text1 flex justify-center items-center text-center h-[.49rem] cursor-pointer"
                  {...bindTrigger(popupState)}
                >
                  {selectedLsdToken?.symbol}

                  <div
                    className={classNames(
                      'absolute w-[.12rem] h-[.12rem] right-[.22rem] top-[.18rem]',
                      popupState.isOpen ? 'rotate-180' : ''
                    )}
                  >
                    <Image src={ArrowDownImg} fill alt="arrow" />
                  </div>
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

                <div
                  className={classNames(
                    'text-[.14rem] leading-[.21rem] text-[#6C86AD] mt-[.15rem] text-center mb-[.36rem]',
                    popupState.isOpen ? 'invisible' : ''
                  )}
                >
                  We currently only support SEI, BNB. To deploy other LSD,
                  please{' '}
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
              link={`${getDocHost()}/develop_evm_lsd/getstarted/`}
            >
              <>
                Supported Networks:
                <br />
                - Sei
                <br />
                - BNB Smart Chain
                <br />
                - Polygon
                <br />- And More are on the way
              </>
            </FaqCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmosPage;

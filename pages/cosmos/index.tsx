import { Popover } from '@mui/material';
import { CustomButton } from 'components/common/CustomButton';
import { FaqCard } from 'components/common/FaqCard';
import { FormCard } from 'components/common/FormCard';
import { TipBar } from 'components/common/TipBar';
import { Icomoon } from 'components/icon/Icomoon';
import { lsdTokenConfigs } from 'config/cosmos/chain';
import { COSMOS_CREATION_STEPS } from 'constants/common';
import { useAppDispatch } from 'hooks/common';
import { LsdTokenConfig } from 'interfaces/common';
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { setCreationStepInfo } from 'redux/reducers/AppSlice';
import { openLink } from 'utils/commonUtils';

const CosmosPage = () => {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [selectedLsdToken, setSelectedLsdToken] = useState<LsdTokenConfig>();

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'token',
  });

  useEffect(() => {
    if (lsdTokenConfigs.length > 0) {
      setSelectedLsdToken(lsdTokenConfigs[0]);
    }
  }, []);

  useEffect(() => {
    dispatch(
      setCreationStepInfo({
        steps: COSMOS_CREATION_STEPS,
        activedIndex: 1,
      })
    );
  }, [dispatch]);

  return (
    <div className="w-smallContentW xl:w-contentW 2xl:w-largeContentW mx-auto">
      <div className="flex justify-center mt-[.42rem]">
        <FormCard title="Choose LSD Token">
          <>
            <TipBar
              content={
                'ATOM Liquid Staking utilizes Neutron infrastructure. Please acknowledge the inherent risks before proceeding.'
              }
              isWarning
              link="https://www.google.com"
              className="mt-[.24rem]"
            />

            <div
              className="bg-[#DEE6F780] rounded-[.2rem] text-[.14rem] text-text1 flex justify-center items-center text-center mt-[.24rem] h-[.49rem] cursor-pointer"
              {...bindTrigger(popupState)}
            >
              {selectedLsdToken?.displayName}
            </div>

            <div className="mt-[.57rem]">
              <CustomButton
                type="primary"
                height=".56rem"
                onClick={() =>
                  router.push(
                    `/cosmos/${selectedLsdToken?.connectionId}/registerPool`
                  )
                }
              >
                Submit
              </CustomButton>
            </div>

            <div className="text-[.14rem] leading-[.21rem] text-[#6C86AD] mt-[.15rem] text-center">
              We currently only support ATOM. To deploy other LSD, please{' '}
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
                  background: '#FFFFFF',
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
              {lsdTokenConfigs.map((lsdTokenConfig, index) => (
                <>
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
                        {lsdTokenConfig.displayName}
                      </div>
                    </div>

                    <div className="mr-[.3rem]">
                      {lsdTokenConfig.connectionId ===
                      selectedLsdToken?.connectionId ? (
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
                </>
              ))}

              <div className="h-[.58rem] flex items-center justify-between">
                <div className="flex items-center">
                  {/* <div className="ml-[.16rem] w-[.28rem] h-[.28rem] relative">
                    <Image src={lsdTokenConfig.icon} alt="logo" layout="fill" />
                  </div> */}

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

        <FaqCard title="LSD Token Name" link="https://www.google.com">
          <>
            Standard:
            <br />
            - No Server Needed
            <br />
            - Able to change to custom at anytime
            <br />
            - Operated by StaFi Stack DAO
            <br />
            <br />
            Custom:
            <br />
            - Server required
            <br />
            - Both Execution & Beacon chain RPC required
            <br />
            - At least run 3 relay instances
            <br />- Maintained by your own
          </>
        </FaqCard>
      </div>
    </div>
  );
};

export default CosmosPage;
import { Popover } from '@mui/material';
import classNames from 'classnames';
import { bindHover, bindPopover } from 'material-ui-popup-state';
import { usePopupState } from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import { getModuleStateIcon } from 'utils/iconUtils';

interface Props {
  text: string;
  state: 'running' | 'paused' | 'not set' | 'stateless' | 'error';
  className?: string;
}

export const ModuleStatePanel = (props: Props) => {
  const { className, state, text } = props;

  const statePopupState = usePopupState({
    variant: 'popover',
    popupId: 'satte',
  });

  const getPopoverText = () => {
    switch (state) {
      case 'not set':
        return 'Open Module and begin your journey';
      case 'running':
        return 'Module is running well';
      case 'paused':
        return 'Module is paused, please click the open button and re-open.';
      case 'error':
        return 'Error happened, please contact StaFi team for support';
      case 'stateless':
        return 'This feature is provided by a third-party service. Please be aware of potential risks associated with using third-party services. We cannot guarantee the performance or reliability of this feature.';
    }
  };

  return (
    <>
      <div
        className={classNames(
          'mt-[.06rem] flex items-center cursor-pointer',
          className || ''
        )}
        {...bindHover(statePopupState)}
      >
        <div className="text-text2 text-[.14rem]">{text}</div>

        <div className="w-[.16rem] h-[.16rem] relative">
          <Image
            className={'ml-[.06rem]'}
            src={getModuleStateIcon(state)}
            layout="fill"
            alt="icon"
          />
        </div>
      </div>

      <Popover
        {...bindPopover(statePopupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        elevation={0}
        sx={{
          marginTop: '.15rem',
          '& .MuiPopover-paper': {
            background: '#ffffff80',
            border: '0.01rem solid #FFFFFF',
            backdropFilter: 'blur(.4rem)',
            borderRadius: '.3rem',
          },
          '& .MuiTypography-root': {
            padding: '0px',
          },
          '& .MuiBox-root': {
            padding: '0px',
          },
        }}
      >
        <div className="w-[2.3rem] max-w-[2.3rem] p-[.16rem] text-text2 text-[.14rem] leading-normal">
          {getPopoverText()}
        </div>
      </Popover>
    </>
  );
};

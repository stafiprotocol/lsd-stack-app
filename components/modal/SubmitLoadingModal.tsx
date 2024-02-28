import { Box, Modal } from '@mui/material';
import classNames from 'classnames';
import { PrimaryLoading } from 'components/common/PrimaryLoading';
import { Icomoon } from 'components/icon/Icomoon';
import { useAppDispatch, useAppSelector } from 'hooks/common';
import Image from 'next/image';
import successIcon from 'public/images/tx_success.png';
import errorIcon from 'public/images/tx_error.png';
import { useMemo } from 'react';
import { setSubmitLoadingParams } from 'redux/reducers/AppSlice';
import { roboto } from 'config/font';
import { getEtherScanTxUrl } from 'config/explorer';

export const SubmitLoadingModal = () => {
  const dispatch = useAppDispatch();
  const { submitLoadingParams } = useAppSelector((state) => state.app);

  const title = useMemo(() => {
    if (submitLoadingParams.status === 'loading') {
      return 'Submitting Settings...';
    } else if (submitLoadingParams.status === 'error') {
      return 'Transaction Failed';
    } else {
      return 'Transaction Succeeded';
    }
  }, [submitLoadingParams]);

  const description = useMemo(() => {
    return submitLoadingParams.msg
      ? submitLoadingParams.msg
      : submitLoadingParams.status === 'success'
      ? `Creating LSD network successful`
      : submitLoadingParams.status === 'error'
      ? 'Something went wrong, please try again'
      : 'Please wait for a moment';
  }, [submitLoadingParams]);

  const closeModal = () => {
    dispatch(
      setSubmitLoadingParams({
        ...submitLoadingParams,
        modalOpened: false,
      })
    );
  };

  return (
    <Modal open={submitLoadingParams.modalOpened}>
      <Box
        pt="0"
        sx={{
          backgroundColor: '#ffffff',
          width: '3.5rem',
          borderRadius: '0.16rem',
          outline: 'none',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className={classNames(
            'flex flex-col items-center relative',
            roboto.className
          )}
        >
          {submitLoadingParams.status !== 'loading' && (
            <div
              className={classNames(
                'right-[.24rem] top-[.24rem] cursor-pointer absolute w-[.16rem] h-[.16rem]'
              )}
              onClick={closeModal}
            >
              <Icomoon icon="close" size=".16rem" color={'#6C86AD80'} />
            </div>
          )}

          {submitLoadingParams.status === 'loading' && (
            <div className="mt-[.35rem] w-[.8rem] h-[.8rem]">
              <PrimaryLoading size=".8rem" />
            </div>
          )}

          {submitLoadingParams.status === 'success' && (
            <div className="mt-[.35rem] w-[.8rem] h-[.8rem] relative">
              <Image src={successIcon} alt="success" layout="fill" />
            </div>
          )}

          {submitLoadingParams.status === 'error' && (
            <div className="mt-[.35rem] w-[.8rem] h-[.8rem] relative">
              <Image src={errorIcon} alt="error" layout="fill" />
            </div>
          )}

          <div
            className={classNames(
              'mx-[.36rem] mt-[.24rem] text-[.24rem] text-color-text1 font-[700] text-center leading-tight'
            )}
          >
            {title}
          </div>

          <div
            className={classNames(
              'mx-[.36rem] mt-[.2rem] mb-[.32rem] leading-tight text-center text-[.16rem] text-color-text2'
            )}
            style={{
              WebkitLineClamp: 5,
              lineClamp: 5,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}
          >
            {description}
          </div>

          {!!submitLoadingParams.txHash && (
            <a
              className="mb-[.32rem] flex items-center"
              href={getEtherScanTxUrl(submitLoadingParams.txHash)}
              target="_blank"
              rel="noreferrer"
            >
              <span className="text-color-link text-[.16rem] mr-[.12rem] font-[500]">
                View on explorer
              </span>

              <Icomoon icon="right" size=".12rem" color={'#5A5DE0'} />
            </a>
          )}
        </div>
      </Box>
    </Modal>
  );
};

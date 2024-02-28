import { Skeleton } from '@mui/material';
import classNames from 'classnames';
import { useAppSelector } from 'hooks/common';
import { RootState } from 'redux/store';

interface Props {
  height: string;
  width?: string;
}

export const DataLoading = (props: Props) => {
  const { height, width } = props;

  return (
    <div
      className={classNames(width ? '' : 'min-w-[0.5rem]')}
      style={{
        ...(width ? { width: width } : {}),
      }}
    >
      <Skeleton
        variant="rounded"
        animation="pulse"
        height={height}
        sx={{
          fontSize: height,
          bgcolor: 'grey.100',
        }}
      />
    </div>
  );
};

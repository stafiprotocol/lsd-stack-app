import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ETH_STANDARD_CREATION_STEPS } from 'constants/common';
import { AppEco } from 'interfaces/common';
import { AppThunk } from 'redux/store';

export interface CreationStepInfo {
  steps: string[];
  activedIndex: number;
}

export interface SubmitLoadingParams {
  status: 'loading' | 'success' | 'error';
  modalOpened: boolean;
  txHash: string;
  msg?: string;
}

export interface AppState {
  appEco: AppEco;
  updateFlag: number;
  submitLoadingParams: SubmitLoadingParams;
  creationStepInfo: CreationStepInfo;
  backRoute: string;
}

const initialState: AppState = {
  appEco: AppEco.Eth,
  updateFlag: 0,
  submitLoadingParams: {
    status: 'loading',
    modalOpened: false,
    txHash: '',
  },
  creationStepInfo: {
    steps: ETH_STANDARD_CREATION_STEPS,
    activedIndex: 0,
  },
  backRoute: '',
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppEco: (state: AppState, action: PayloadAction<AppEco>) => {
      state.appEco = action.payload;
    },
    setUpdateFlag: (state: AppState, action: PayloadAction<number>) => {
      state.updateFlag = action.payload;
    },
    setSubmitLoadingParams: (
      state: AppState,
      action: PayloadAction<SubmitLoadingParams>
    ) => {
      state.submitLoadingParams = action.payload;
    },
    setCreationStepInfo: (
      state: AppState,
      action: PayloadAction<CreationStepInfo>
    ) => {
      state.creationStepInfo = action.payload;
    },
    setBackRoute: (state: AppState, action: PayloadAction<string>) => {
      state.backRoute = action.payload;
    },
  },
});

export const {
  setAppEco,
  setUpdateFlag,
  setSubmitLoadingParams,
  setCreationStepInfo,
  setBackRoute,
} = appSlice.actions;

export default appSlice.reducer;

export const updateCreationStepActivedIndex =
  (index: number): AppThunk =>
  async (dispatch, getState) => {};

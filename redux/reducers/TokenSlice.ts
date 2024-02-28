import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface TokenState {
  ntrnPrice: number | undefined;
}

const initialState: TokenState = {
  ntrnPrice: undefined,
};

export const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setNtrnPrice: (state: TokenState, action: PayloadAction<number>) => {
      state.ntrnPrice = action.payload;
    },
  },
});

export const { setNtrnPrice } = tokenSlice.actions;

export default tokenSlice.reducer;

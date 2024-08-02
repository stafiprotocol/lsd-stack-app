import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import appReducer from './reducers/AppSlice';
import walletReducer from './reducers/WalletSlice';
import lsdReducer from './reducers/LsdSlice';
import evmLsdReducer from './reducers/EvmLsdSlice';
import lrtReducer from './reducers/LrtSlice';
import cosmosLsdReducer from './reducers/CosmosLsdSlice';
import solReducer from './reducers/SolSlice';
import tokenReducer from './reducers/TokenSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    wallet: walletReducer,
    lsd: lsdReducer,
    evmLsd: evmLsdReducer,
    lrt: lrtReducer,
    cosmosLsd: cosmosLsdReducer,
    sol: solReducer,
    token: tokenReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import siteReducer from './slices/siteSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    site: siteReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

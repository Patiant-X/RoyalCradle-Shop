import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice';
import cartSliceReducer from './slices/cartSlice';
import addressSliceReducer from './slices/addressSlice';
import authReducer from './slices/authSlice';
import webRTCReducer from './slices/webrtcSlices';
import restaurantReducer from './slices/restaurantSlice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    cart: cartSliceReducer,
    auth: authReducer,
    address: addressSliceReducer,
    webrtc: webRTCReducer,
    restaurant: restaurantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

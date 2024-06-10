import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shopAddresses: JSON.parse(localStorage.getItem('shopAddresses')) || [],
  clientAddress: JSON.parse(localStorage.getItem('clientAddress')) || null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setShopAddress: (state, action) => {
      state.shopAddresses.push(action.payload);
      localStorage.setItem(
        'shopAddresses',
        JSON.stringify(state.shopAddresses)
      );
    },
    setClientAddress: (state, action) => {
      state.clientAddress = action.payload;
      localStorage.setItem('clientAddress', JSON.stringify(action.payload));
    },
    deleteShopAddress: (state, action) => {
      state.shopAddresses = state.shopAddresses.filter(
        (shop) => shop.location !== action.payload
      );
      console.log(state.shopAddresses);
      localStorage.setItem(
        'shopAddresses',
        JSON.stringify(state.shopAddresses)
      );
    },
    deleteClientAddress: (state) => {
      state.clientAddress = null;
      localStorage.removeItem('clientAddress');
    },
  },
});

export const {
  setShopAddress,
  setClientAddress,
  deleteShopAddress,
  deleteClientAddress,
} = addressSlice.actions;

export default addressSlice.reducer;

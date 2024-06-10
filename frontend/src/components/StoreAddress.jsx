import React, { useState } from 'react';
import AddressData from './AddressData';
import { useDispatch } from 'react-redux';
import { setClientAddress, setShopAddress } from '../slices/addressSlice';

const StoreAddress = ({ label, setAddress }) => {
  const dispatch = useDispatch();
    // if(address != null) {
    //     if (label === 'Enter shop address:') {
    //         dispatch(setShopAddress(address)) 
    //     }else {
    //         dispatch(setClientAddress(address))
    //     }
       
    // }
  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          marginRight: '10px',
          marginBottom: '5px',
          padding: '5px',
        }}
      >
        {label}
      </label>
      <AddressData setAddressCoordinates={setAddress} />
    </div>
  );
};

export default StoreAddress;

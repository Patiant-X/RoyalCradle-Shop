import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, Card, Form, Row, Col,
} from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  deleteClientAddress, deleteShopAddress, setClientAddress, setShopAddress,
} from '../slices/addressSlice';
import StoreAddress from './StoreAddress';

const EveryWhereAddressManagement = ({ onGenerateDeliveryFee }) => {
  const dispatch = useDispatch();
  const { shopAddresses, clientAddress } = useSelector((state) => state.address);
  const [address, setAddress] = useState(null);
  const [numStops, setNumStops] = useState(0);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    setUpdated(false);
  }, [shopAddresses, clientAddress]);

  const handleDeleteShopAddress = (location) => {
    dispatch(deleteShopAddress(location));
    setUpdated(true);
  };

  const handleDeleteClientAddress = () => {
    dispatch(deleteClientAddress());
    setUpdated(true);
  };

  const handleStoreAddress = (addressType) => {
    if (!address) return;

    const location = address.place.address_components.map((component) => component.long_name).join(' ');
    const lat = address.lat;
    const lng = address.lng;
    const address_2 = { location, lat, lng };

    const exists = shopAddresses.some((shop) => shop.location === address_2.location);
    if (exists) {
      toast.error('Shop already in List');
      setUpdated(true);
      return;
    }

    if (addressType === 'store') {
      dispatch(setShopAddress(address_2));
    } else {
      dispatch(setClientAddress(address_2));
    }
    setUpdated(true);
  };

  return (
    <>
      <Row className='mt-4'>
        <Col md={6}>
          <h3>Your Location</h3>
          {clientAddress ? (
            <div className='d-flex align-items-center mb-3'>
              <strong className='me-2'>Location:</strong>
              <span>{clientAddress.location}</span>
              <Button variant='danger' className='ms-auto' onClick={handleDeleteClientAddress}>
                <FaTrash />
              </Button>
            </div>
          ) : (
            <p>No location added</p>
          )}
        </Col>

        <Col md={6}>
          <h3>Number of Stops</h3>
          <Form.Control
            type='number'
            min='0'
            value={numStops}
            onChange={(e) => setNumStops(e.target.value)}
            placeholder='Enter number of stops'
          />
        </Col>
      </Row>

      <Row className='mt-4'>
        <Col md={6}>
          <h3>Store Addresses</h3>
          {shopAddresses.length > 0 ? (
            shopAddresses.map((shop, index) => (
              <div key={index} className='d-flex align-items-center mb-3'>
                <span>{shop.location}</span>
                <Button variant='danger' className='ms-auto' onClick={() => handleDeleteShopAddress(shop.location)}>
                  <FaTrash />
                </Button>
              </div>
            ))
          ) : (
            <p>No stores added</p>
          )}
        </Col>

        <Col md={6} className='d-flex align-items-center'>
          <StoreAddress setAddress={setAddress} />
          <Button variant='link' onClick={() => handleStoreAddress(clientAddress ? 'store' : 'client')}>
            <FaPlus size={20} />
          </Button>
        </Col>
      </Row>

      <div className='d-flex justify-content-center mt-4'>
        {clientAddress && shopAddresses.length > 0 && (
          <Button variant='primary' onClick={onGenerateDeliveryFee}>
            Generate Delivery Fee
          </Button>
        )}
      </div>
    </>
  );
};

export default EveryWhereAddressManagement;

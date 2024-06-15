import { useState } from 'react';
import {
  Form,
  Button,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import AddressData from '../components/AddressData';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {
  const restaurantList = useSelector(
    (state) => state.restaurant.restaurantList
  );
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [address, setAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState(null); // 'delivery' or 'pickup'
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const restaurantItemWithProduct = restaurantList.find((restaurant) =>
    cartItems.some((item) => item.user === restaurant.user._id)
  );

  if (!restaurantItemWithProduct) {
    toast.error('Restaurant information not found. Please try again.');
    navigate('/');
    return null;
  }

  const submitDeliveryHandler = (e) => {
    e.preventDefault();
    if (address?.place && address?.lat && address?.lng) {
      const location = address.place.address_components
        .map((component) => component.long_name)
        .join(' ');
      const { lat, lng } = address;
      dispatch(saveShippingAddress({ location, lat, lng, delivery: true }));
      navigate('/payment');
    } else {
      toast.error('Please select an address from Google suggestions.');
    }
  };

  const submitPickUpHandler = (e) => {
    e.preventDefault();
    const firstItem = cartItems[0];
    if (firstItem) {
      const location = firstItem.location.address;
      const { latitude: lat, longitude: lng } = firstItem.location;
      dispatch(saveShippingAddress({ location, lat, lng, delivery: false }));
      navigate('/payment');
    } else {
      toast.error('Sorry, no items found in the cart.');
    }
  };

  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      {restaurantItemWithProduct.deliveryOptions.includes('delivery') && (
        <div className='delivery-method-toggle'>
          <ToggleButtonGroup
            type='radio'
            name='deliveryOptions'
            value={deliveryMethod}
            onChange={handleDeliveryMethodChange}
          >
            <ToggleButton
              id='delivery'
              value='delivery'
              variant={
                deliveryMethod === 'delivery' ? 'primary' : 'outline-primary'
              }
            >
              Delivery
            </ToggleButton>
            <ToggleButton
              id='pickup'
              value='pickup'
              variant={
                deliveryMethod === 'pickup' ? 'primary' : 'outline-primary'
              }
            >
              Pick-up
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}

      {deliveryMethod === 'delivery' && (
        <Form onSubmit={submitDeliveryHandler}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                marginRight: '10px',
                marginBottom: '5px',
                padding: '5px',
              }}
            >
              Enter address:
            </label>
            <AddressData setAddressCoordinates={setAddress} />
          </div>
          <Form.Group className='my-4' controlId='address'>
            <Form.Label>Confirm Address</Form.Label>
            <Form.Control
              type='text'
              placeholder='Confirm address'
              value={
                address?.place
                  ? address.place.address_components
                      .map((component) => component.long_name)
                      .join(' ')
                  : ''
              }
              required
              readOnly
            ></Form.Control>
          </Form.Group>
          <Button type='submit' variant='primary'>
            Continue with Delivery
          </Button>
        </Form>
      )}

      {deliveryMethod === 'pickup' && (
        <Button type='button' variant='primary' onClick={submitPickUpHandler}>
          Continue with Pick-up
        </Button>
      )}

      {!restaurantItemWithProduct.deliveryOptions.includes('delivery') && (
        <Button type='button' variant='secondary' onClick={submitPickUpHandler}>
          Continue with Pick-up
        </Button>
      )}
    </FormContainer>
  );
};

export default ShippingScreen;

import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import AddressData from '../components/AddressData';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [address, setAddress] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitDeliveryHandler = (e) => {
    e.preventDefault();
    try {
      if (
        address?.place != null &&
        address?.lat != null &&
        address?.lng != null
      ) {
        const location = address.place.address_components
          .map((component) => component.long_name)
          .join(' ');
        const lat = address.lat;
        const lng = address.lng;
        const delivery = true;
        dispatch(saveShippingAddress({ location, lat, lng, delivery }));
        navigate('/payment');
      } else {
        toast.error('Please select address from google suggestions');
      }
    } catch (error) {
      // Check if error has a specific message property
      const errorMessage = error.message ? error.message : 'An error occurred';
      toast.error(errorMessage);
    }
  };

  const submitPickUpHandler = (e) => {
    e.preventDefault();
    toast.error('Sorry, this product is not available for collection');
    return;
    // eslint-disable-next-line no-unreachable
    const product = cartItems?.find((item) => item.IsFood === true);
    const notFoodProduct = cartItems?.find((item) => item.IsFood === false);
    if (notFoodProduct) {
      toast.error(
        'Sorry, only food items can be collected not drinks. Please remove drink from cart'
      );
      return;
    }
    if (product) {
      const location = product.location?.address;
      const lat = product.location?.latitude;
      const lng = product.location?.longitude;
      const delivery = false;
      dispatch(saveShippingAddress({ location, lat, lng, delivery }));
      // Navigate to the payment page or any other necessary action
      navigate('/payment');
    } else {
      toast.error('Sorry, only Food items can be collected');
      return;
    }
  };

  return (
    <>
      <FormContainer>
        <CheckoutSteps step1 step2 />
        <h1>Delivery</h1>
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
            <Form.Label>Confrim Address</Form.Label>
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
          {/* <Button
            type='button'
            variant='secondary'
            className='mx-0 mx-sm-2 mt-2 mt-sm-0'
            onClick={submitPickUpHandler}
          >
            Continue with Pick-up
          </Button> */}
        </Form>
      </FormContainer>
    </>
  );
};

export default ShippingScreen;

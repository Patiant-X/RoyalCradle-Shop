import { useState, useEffect } from 'react';
import { Form, Button, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../slices/cartSlice';
import { toast } from 'react-toastify';

const PaymentScreen = () => {
  const restaurantList = useSelector((state) => state.restaurant.restaurantList);
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const restaurantItemWithProduct = restaurantList.find((restaurant) =>
    cart.cartItems.some((item) => item.user === restaurant.user._id)
  );

  useEffect(() => {
    if (!shippingAddress.location) {
      navigate('/shipping');
    }
  }, [navigate, shippingAddress]);

  const [paymentMethod, setPaymentMethod] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  if (!restaurantItemWithProduct) {
    toast.error('Restaurant information not found. Please try again.');
    navigate('/');
    return null;
  }

  const { paymentMethods } = restaurantItemWithProduct;

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as='legend'>Select Method</Form.Label>
          <Col>
            {paymentMethods.includes('card') && (
              <Form.Check
                className='my-2'
                type='radio'
                label='Debit or Credit Card (Online)'
                id='Card'
                name='paymentMethod'
                value='card'
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              ></Form.Check>
            )}
            {paymentMethods.includes('cash') && (
              <Form.Check
                className='my-2'
                type='radio'
                label='Cash /or Use Restaurant Swiping Machine'
                id='Cash'
                name='paymentMethod'
                value='cash'
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              ></Form.Check>
            )}
            {!paymentMethods.includes('card') && !paymentMethods.includes('cash') && (
              <Alert variant='danger'>
                This restaurant does not support payments. Please contact the restaurant for payment options.
              </Alert>
            )}
          </Col>
        </Form.Group>
        {(paymentMethods.includes('card') || paymentMethods.includes('cash')) && (
          <Button type='submit' variant='primary'>
            Continue
          </Button>
        )}
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;

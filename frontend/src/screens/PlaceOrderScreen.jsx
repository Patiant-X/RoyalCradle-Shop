import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import {
  useCreateOrderMutation,
  useDeleteOrderMutation,
} from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import PayYocoButton from '../components/PayYocoButton';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const [deleteOrder, { isLoading: loadingDelete }] = useDeleteOrderMutation();
  const { data: orders, isLoading: loadingOrders } = useGetMyOrdersQuery();

  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!cart.shippingAddress.location) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.location, navigate]);



  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row className='pb-5'>
        <Col md={8}>
          {}
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>{shippingAddress?.delivery ? 'Delivery' : 'Pick-up'}</h2>
              <p>
                <strong style={{ marginRight: '3px' }}>
                  {shippingAddress?.delivery ? 'Address' : 'Pick-up Address'} :
                </strong>
                {cart.shippingAddress.location}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <strong>Method: </strong>
              {cart.paymentMethod.toUpperCase()}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cart?.cartItems?.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {cart?.cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item?.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item._id}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x R{item.price} = R
                          {(item.qty * (item.price * 100)) / 100}
                        </Col>
                      </Row>
                      <Row>
                        <Col className='p-2'>
                          <strong>Customer note: </strong>
                          {item.additionalInfo}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>R{cart.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Delivery</Col>
                  <Col>R{cart.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Service</Col>
                  <Col>R{cart.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>R{cart.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {error && (
                  <Message variant='danger'>{error.data.message}</Message>
                )}
              </ListGroup.Item>
              <PayYocoButton
                userInfo={userInfo}
                cart={cart}
                orders={orders}
                deleteOrder={deleteOrder}
                createOrder={createOrder}
                shippingAddress={shippingAddress}
                dispatch={dispatch}
                clearCartItems={clearCartItems}
                navigate={navigate}
                isLoading={isLoading}
              />
              {loadingOrders && <Loader />}
              {isLoading && <Loader />}
              {loadingDelete && <Loader />}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;

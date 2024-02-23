import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCcMastercard, FaCcVisa } from 'react-icons/fa';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
} from '../slices/ordersApiSlice';

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  /* This is driver logic */
  const restaurantAddress =
    order?.orderItems.find((item) => item.IsFood)?.location?.address ||
    'Find Item at closest shop';

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  const { userInfo } = useSelector((state) => state.auth);
  const PayYoco = async () => {
    try {
      const res = await payOrder({ orderId });
      const { redirectUrl } = res.data;

      // Redirect the user to the urlredirect link
      window.location.href = redirectUrl;
    } catch (error) {
      toast.error('Payment failed');
    }
  };
  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error?.data?.message || error.error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>
                {order.shippingAddress?.delivery ? 'Delivery' : 'Pick-up'}
              </h2>
              <p>
                <strong>Name: </strong> {order.user?.name || 'Client Name'}
              </p>
              <p>
                <strong>Cellphone Number: </strong> {order?.user?.mobileNumber}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                {order.shippingAddress?.delivery ? (
                  <strong> Address: </strong>
                ) : (
                  <strong>Pick-up Address: </strong>
                )}
                {order.shippingAddress.address}
              </p>

              <p>
                {userInfo &&
                  (userInfo.role === 'driver' || userInfo.role === 'admin') &&
                  `Restaurant address: ${restaurantAddress}`}
              </p>

              {order.shippingAddress.delivery ? (
                order.isDelivered ? (
                  <Message variant='success'>
                    Delivered on {order.deliveredAt}
                  </Message>
                ) : (
                  <Message variant='danger'>Not Delivered</Message>
                )
              ) : order.isDelivered ? (
                <Message variant='success'>
                  Collected on {order.deliveredAt}
                </Message>
              ) : (
                <Message variant='danger'>Not Collected</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod.toUpperCase()}
              </p>
              {order.isPaid &&
              order.paymentMethod === 'card' &&
              order.paidAt ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : order.isDelivered &&
                order.paymentMethod === 'cash' &&
                order.paidAt ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x R{item.price} = R{item.qty * item.price}
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
                  <Col>R{order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Delivery</Col>
                  <Col>R{order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Services</Col>
                  <Col>R{order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>R{order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {userInfo &&
                (userInfo.role === 'admin' || userInfo.role === 'customer') &&
                !order.isPaid && (
                  <ListGroup.Item>
                    {loadingPay && <Loader />}

                    {isLoading ? (
                      <Loader />
                    ) : (
                      <div>
                        <div>
                          <Button
                            onClick={() => PayYoco()}
                            style={{
                              marginTop: `10px`,
                              backgroundColor: '#00a9e0',
                              width: '100%',
                            }}
                          >
                            Procceed to Payment
                          </Button>
                          <p style={{ paddingTop: '20px' }}>
                            We accept Visa Mastercard InstantEFT:
                          </p>
                          <Row
                            className='justify-content-center'
                            style={{ marginTop: '20px' }}
                          >
                            <Col xs={6} sm={4}>
                              <FaCcVisa
                                size='50'
                                color='#1e3050'
                                style={{ marginTop: `5px` }}
                              />
                            </Col>
                            <Col xs={6} sm={4}>
                              <FaCcMastercard
                                size='50'
                                color='#1e3050'
                                style={{ marginTop: `5px` }}
                              />
                            </Col>
                          </Row>
                          <p style={{ paddingTop: '20px' }}>
                            Yoco offers a secure payment system trusted by
                            businesses and customers alike. With robust
                            encryption and advanced fraud prevention measures,
                            your transactions are safeguarded every step of the
                            way.
                          </p>
                        </div>
                      </div>
                    )}
                  </ListGroup.Item>
                )}

              {loadingDeliver && <Loader />}

              {userInfo &&
                (userInfo.role === 'admin' || userInfo.role === 'driver') &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={deliverHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;

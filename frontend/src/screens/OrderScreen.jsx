import { Link, useParams } from 'react-router-dom';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Button,
  Alert,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useCollectOrderMutation,
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
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

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  const [collectOrder, { isLoading: loadingCollect }] =
    useCollectOrderMutation();

  const { userInfo } = useSelector((state) => state.auth);
  const deliverHandler = async () => {
    await deliverOrder(orderId);
    toast.success('Order has been delivered; Thank You!');
    refetch();
  };

  const handleOrderCollected = async () => {
    await collectOrder(orderId);
    toast.success('Order Collected; Please Deliver order to Client');
    refetch();
  };

  const hasFoodProduct = order?.orderItems?.some(
    (item) => item.IsFood === true
  );
  // Determine the status message based on the order status
  let statusMessage = {
    time: '',
    orderMessage: '',
  };

  if (hasFoodProduct) {
    // There is at least one product with IsFood property set to true
    if (order?.isDelivered) {
      statusMessage.orderMessage = 'Order delivered';
      statusMessage.time = 'N/A';
    } else if (order?.isPaid && userInfo && order?.driverAccepted) {
      statusMessage.orderMessage = 'Driver is on his way...';
      if (order.shippingPrice <= 10) {
        statusMessage.time = '10 - 15 minutes';
      } else if (order.shippingPrice > 10 && order.shippingPrice <= 20) {
        statusMessage.time = '15 - 25 minutes';
      }
    } else if (order?.isPaid && userInfo) {
      statusMessage.orderMessage = 'Restaurant is preparing order...';
      if (order.shippingPrice <= 10) {
        statusMessage.time = '25 - 45 minutes';
      } else if (order.shippingPrice > 10 && order.shippingPrice <= 20) {
        statusMessage.time = '35 - 55 minutes';
      }
    } else {
      statusMessage.orderMessage = 'Order pending...';
      statusMessage.time = '...';
    }
  } else {
    // There are no products with IsFood property set to true
    if (order?.isDelivered) {
      statusMessage.orderMessage = 'Order delivered';
      statusMessage.time = 'N/A';
    } else {
      statusMessage.orderMessage = 'Driver is on his way...';
      statusMessage.time = '10 - 15 minutes';
    }
  }

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error?.data?.message || error.error}</Message>
  ) : (
    <>
      <Alert variant='info'>
        <h2>Order Status: {statusMessage.orderMessage}</h2>
        <h4>Estimated Time: {statusMessage.time}</h4>
        {!(userInfo.role === 'customer')
          ? order.driver && (
              <>
                <p style={{ margin: '0', paddingBottom: '8px' }}>
                  Driver Details: {order?.driver?._id}, {order?.driver?.name},{' '}
                  {order?.driver?.mobileNumber}
                </p>
              </>
            )
          : order.driver && (
              <>
                <p style={{ margin: '0', paddingBottom: '8px' }}>
                  Driver Details: {order?.driver?.name},{' '}
                  {order?.driver?.mobileNumber}
                </p>
              </>
            )}
        <p style={{ margin: '0' }}>Order Number:{order?._id}</p>
      </Alert>
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

              {loadingDeliver && <Loader />}

              {userInfo &&
                (userInfo.role === 'admin' || userInfo.role === 'driver') &&
                order.isPaid &&
                !order.isDelivered &&
                order?.driverAccepted && (
                  <ListGroup.Item>
                    {loadingDeliver && <Loader />}
                    <Button
                      type='button'
                      className='btn btn-block danger'
                      style={{ backgroundColor: 'red' }}
                      onClick={deliverHandler}
                    >
                      Order Delivered
                    </Button>
                  </ListGroup.Item>
                )}
              {userInfo &&
                (userInfo.role === 'admin' || userInfo.role === 'driver') &&
                order.isPaid &&
                !order.isDelivered &&
                !order?.driverAccepted && (
                  <ListGroup.Item>
                    {loadingCollect && <Loader />}
                    <Button
                      type='button'
                      className='btn btn-block btn-order'
                      style={{ backgroundColor: 'red' }}
                      onClick={handleOrderCollected}
                    >
                      Collect Order
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

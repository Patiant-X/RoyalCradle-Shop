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
  useDriverArrivedOrderMutation,
  useGetOrderDetailsQuery,
  useRestaurantConfirmationOrderMutation,
} from '../slices/ordersApiSlice';
import usePushNotifications from '../hooks/usePushNotifications.js';
import useSendNotification from '../hooks/useSendNotification.js';
import {
  driverArrivedNotification,
  orderCollectedNotification,
  orderDeliveredNotification,
  restaurantConfirmedNotification,
  userCollectsOrderNotification,
} from '../data/notificationData.js';

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const sendNotification = useSendNotification();

  // Hook for subscribing user
  usePushNotifications();

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

  const [
    restaurantConfirmationOrder,
    {
      isLoading: loadingRestaurantCOnfrimation,
      isError: isErrorRestaurantConfirmation,
    },
  ] = useRestaurantConfirmationOrderMutation();

  const [
    deliverOrder,
    { isLoading: loadingDeliver, isError: isErrorDeliverOrder },
  ] = useDeliverOrderMutation();

  const [
    collectOrder,
    { isLoading: loadingCollect, isError: isErrorCollectOrder },
  ] = useCollectOrderMutation();

  const [
    driverArrivedOrder,
    { isLoading: loadingDriverArrived, isError: isErrordriverArrivedOrder },
  ] = useDriverArrivedOrderMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const userCollectsOrderHandler = async () => {
    // Send notification to the user
    sendNotification({
      notification: userCollectsOrderNotification, // Use the notification data imported
      userId: order?.user?._id,
    });
    toast.success('Notification sent to the user');
  };

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    if (!isErrorDeliverOrder) {
      sendNotification({
        notification: orderDeliveredNotification,
        userId: order?.user?._id,
      });
      toast.success('Order has been delivered; Thank You!');
    } else {
      toast.error('Order delivery failed');
    }

    refetch();
  };

  //This should be changed to restaurant driver has arrived and is outside please collect your order.
  const driverArrivedHandler = async () => {
    await driverArrivedOrder(orderId);
    if (isErrordriverArrivedOrder) {
      toast.error('Sending Message failed');
    } else {
      sendNotification({
        notification: driverArrivedNotification,
        userId: order?.user?._id,
      });
    }
    refetch();
  };

  // This will be instead of order collected will be a function for the restaurant to confirm order
  // Also create a function where the restaurant will say the order is almost ready
  // These functions should be independent of either it's a delivery or collection
  const handleOrderCollected = async () => {
    await collectOrder(orderId);

    if (!isErrorCollectOrder) {
      sendNotification({
        notification: orderCollectedNotification,
        userId: order?.user?._id,
      });
      toast.success('Order Collected; Please Deliver order to Client');
    } else {
      toast.error('Order collection failed');
    }
    refetch();
  };

  const handleAction = async (
    mutation,
    notification,
    successMessage,
    errorMessage
  ) => {
    try {
      await mutation(orderId);
      sendNotification({
        notification,
        userId: order?.user?._id,
      });
      toast.success(successMessage);
    } catch (error) {
      toast.error(errorMessage || error?.error);
    } finally {
      refetch();
    }
  };

  const handleRestaurantConfirmation = async () => {
    try {
      await restaurantConfirmationOrder(orderId);
      sendNotification({
        notification: restaurantConfirmedNotification,
        userId: order?.user?._id,
      });
      toast.success('Restaurant has confirmed the order');
    } catch (error) {
      toast.error('Restaurant confirmation failed');
    } finally {
      refetch();
    }
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
    if (!order?.shippingAddress?.delivery) {
      // For pick-up orders
      if (order?.isDelivered) {
        statusMessage.orderMessage = 'Order collected';
        statusMessage.time = 'N/A';
      } else {
        statusMessage.orderMessage = 'Restaurant is preparing order...';
        statusMessage.time = '25-35 min* depends on item type';
      }
    } else {
      // For delivery orders
      if (order?.isDelivered) {
        statusMessage.orderMessage = 'Order delivered';
        statusMessage.time = 'N/A';
      } else if (order?.isPaid && userInfo && order?.driverAccepted) {
        statusMessage.orderMessage = 'Driver is on his way...';
        if (order?.shippingPrice <= 10) {
          statusMessage.time = '10 - 15 minutes';
        } else if (order?.shippingPrice > 10 && order?.shippingPrice <= 20) {
          statusMessage.time = '15 - 25 minutes';
        }
      } else if (order?.isPaid && userInfo) {
        statusMessage.orderMessage = 'Restaurant is preparing order...';
        if (order?.shippingPrice <= 10) {
          statusMessage.time = '25 - 45 minutes';
        } else if (order?.shippingPrice > 10 && order?.shippingPrice <= 20) {
          statusMessage.time = '35 - 55 minutes';
        }
      } else {
        statusMessage.orderMessage = 'Order pending...';
        statusMessage.time = '...';
      }
    }
  } else {
    // There are no products with IsFood property set to true
    if (order?.isDelivered) {
      statusMessage.orderMessage = 'Order delivered';
      statusMessage.time = 'N/A';
    } else if (order?.shippingAddress?.delivery) {
      statusMessage.orderMessage = 'Driver is on his way...';
      statusMessage.time = '10 - 15 minutes';
    } else {
      statusMessage.orderMessage = 'Please come collect';
      statusMessage.time = '15min';
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
        <p className='m-0 mt-4 fw-bold italics center'>
          **Please allow notifications to receive updates about order**
        </p>
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

              {/** Restaurant Order Process Logic */}

              {
                //The restaurant must confirm the order.
                userInfo &&
                  (userInfo.role === 'admin' ||
                    userInfo.role === 'restaurant') &&
                  order.isPaid &&
                  !order.restaurantConfirmation && (
                    <ListGroup.Item>
                      {loadingDeliver && <Loader />}
                      <Button
                        type='button'
                        className='btn btn-block danger'
                        style={{ backgroundColor: 'red' }}
                        onClick={handleRestaurantConfirmation}
                      >
                        Confirm Order
                      </Button>
                    </ListGroup.Item>
                  )
              }

              {userInfo &&
                (userInfo.role === 'admin' || userInfo.role === 'restaurant') &&
                order.isPaid &&
                order.restaurantConfirmation &&
                !order.isDelivered && ( //This should be checked
                  <ListGroup.Item>
                    {loadingDeliver && <Loader />}
                    <Button
                      type='button'
                      className='btn btn-block danger'
                      style={{ backgroundColor: 'red' }}
                      onClick={deliverHandler}
                    >
                      Order Collected
                    </Button>
                  </ListGroup.Item>
                )}
              {userInfo &&
                !order.isDelivered &&
                (userInfo.role === 'admin' || userInfo.role === 'restaurant') &&
                order.restaurantConfirmation &&
                !order.shippingAddress?.delivery && (
                  // Change the function name
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block btn-order'
                      style={{ backgroundColor: 'green' }}
                      onClick={userCollectsOrderHandler}
                    >
                      Order is Ready
                    </Button>
                  </ListGroup.Item>
                )}

              {/** Restaurant Order Process Logic */}

              {userInfo &&
                (userInfo.role === 'admin' || userInfo.role === 'driver') &&
                order.isPaid &&
                order.restaurantConfirmation &&
                !order.isDelivered &&
                order?.driverAccepted &&
                !order?.driverArrived && (
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
                order.restaurantConfirmation &&
                !order.isDelivered &&
                !order?.driverAccepted &&
                order.shippingAddress?.delivery && (
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
              {userInfo &&
                order.shippingAddress?.delivery &&
                (userInfo.role === 'admin' || userInfo.role === 'driver') &&
                order.isPaid &&
                order.restaurantConfirmation &&
                !order.isDelivered &&
                order?.driverAccepted &&
                !order?.driverArrived && (
                  <ListGroup.Item>
                    {loadingDriverArrived && <Loader />}
                    <Button
                      type='button'
                      className='btn btn-block btn-order'
                      style={{ backgroundColor: 'red' }}
                      onClick={driverArrivedHandler}
                    >
                      You have Arrived
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

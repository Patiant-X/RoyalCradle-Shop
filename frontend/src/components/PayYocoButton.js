import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from './Loader';

const PayYocoButton = ({
  userInfo,
  cart,
  orders,
  deleteOrder,
  createOrder,
  shippingAddress,
  dispatch,
  clearCartItems,
  navigate,
  isLoading,
}) => {
  const placeOrderHandler = async () => {
    try {
      // Check if there are any unpaid cash orders
      const undeliveredCashOrders = orders.filter(
        (order) => !order.isDelivered && order.paymentMethod === 'cash'
      );

      if (undeliveredCashOrders.length > 0) {
        // Inform the user about the existing unpaid cash order
        toast('There is a cash order in progress. Please complete order.');
        return;
      }

      // Check if there are any unpaid card orders
      const unpaidCardOrders = orders.filter(
        (order) => !order.isPaid && order.paymentMethod === 'card'
      );

      if (unpaidCardOrders.length > 0) {
        // Delete the first unpaid card order
        await deleteOrder({ orderId: unpaidCardOrders[0]._id }).unwrap();
      }

      // create the new order
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();

      // Check if redirectUrl exists in the response data
      if (res.redirectUrl) {
        dispatch(clearCartItems());
        console.log(res.redirectUrl);
        // Redirect the user to the redirectUrl link
        window.location.href = res.redirectUrl;
      } else if (!res.redirectUrl) {
        dispatch(clearCartItems());
        navigate(`/order/${res._id}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'An error occurred');
    }
  };

  return (
    <>
      {userInfo &&
        !(cart?.cartItems?.length === 0) &&
        (userInfo.role === 'admin' || userInfo.role === 'customer') && (
          <ListGroup.Item>
            {isLoading ? (
              <Loader />
            ) : (
              <div>
                <Button
                  onClick={() => placeOrderHandler()}
                  style={{
                    marginTop: `10px`,
                    backgroundColor: '#00a9e0',
                    width: '100%',
                  }}
                >
                  Place Order
                </Button>
              </div>
            )}
          </ListGroup.Item>
        )}
    </>
  );
};

export default PayYocoButton;

import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';

const RestaurantOrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  var paidOrders = orders
    ?.filter((order) => order.isPaid)
    ?.sort((a, b) => {
      // If a is not delivered and b is delivered, a should come before b
      if (a.isDelivered === false && b.isDelivered === true) {
        return -1;
      }
      // If b is not delivered and a is delivered, b should come before a
      if (b.isDelivered === false && a.isDelivered === true) {
        return 1;
      }
      // For all other cases, maintain the original order
      return 0;
    });
  
  return (
    <>
      <h1>Orders</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm'>
          <thead>
            <tr>
              <th></th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED/COLLECTED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paidOrders?.map((order) => (
              <tr key={order._id}>
                <td>{order.paymentMethod.toUpperCase()}</td>
                <td>{order.createdAt && order.createdAt.substring(0, 10)}</td>
                <td>R{order.totalPrice}</td>
                <td>
                  {order.isPaid &&
                  order.paymentMethod === 'card' &&
                  order.paidAt ? (
                    order.paidAt.substring(0, 10)
                  ) : order.isDelivered &&
                    order.paymentMethod === 'cash' &&
                    order.paidAt ? (
                    order.paidAt.substring(0, 10)
                  ) : (
                    <FaTimes style={{ color: 'red' }} />
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    order.deliveredAt.substring(0, 10)
                  ) : (
                    <FaTimes style={{ color: 'red' }} />
                  )}
                </td>
                <td>
                  <LinkContainer to={`/order/${order._id}`}>
                    <Button variant='light' className='btn-sm'>
                      Details
                    </Button>
                  </LinkContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default RestaurantOrderListScreen;

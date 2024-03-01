import React from 'react';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { FaCheck, FaTimes } from 'react-icons/fa';

import Message from '../components/Message';
import Loader from '../components/Loader';

import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';

const OrdersScreen = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();
  const unpaidOrders =  orders?.slice()?.sort((a, b) => {
     // If a is not paid and b is paid, a should come before b
     if (a.isPaid === false && b.isPaid === true) {
      return -1;
    }
    // If b is not paid and a is paid, b should come before a
    if (b.isPaid === false && a.isPaid === true) {
      return 1;
    }
    // For all other cases, maintain the original order
    return 0;
  });
  return (
    <Row>
      <Col>
        <h2>My Orders</h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <Table striped hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {unpaidOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>R{order.totalPrice}</td>
                  <td>
                    {order.isPaid &&
                    order.paymentMethod === 'card' &&
                    order.paidAt ? (
                      <FaCheck style={{ color: 'green' }} />
                    ) : order.isDelivered &&
                      order.paymentMethod === 'cash' &&
                      order.paidAt ? (
                        <FaCheck style={{ color: 'green' }} />
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
                      <Button className='btn-sm' variant='light'>
                        Details
                      </Button>
                    </LinkContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default OrdersScreen;

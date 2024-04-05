import { useSocketContext } from '../context/SocketContext.js';
import { useEffect } from 'react';
import addNotification from 'react-push-notification';

const useListenNewOrders = () => {
  const { socket } = useSocketContext();

  useEffect(() => {
    // Listen for 'newOrder' event from socket
    if (socket) {
      const handleNewOrder = (newOrder) => {
        if (newOrder === 'It worked') {
          addNotification({
            title: 'Thabani',
            message: 'It worked, please tell Thabani',
            duration: 5000,
          });
        } else {
          addNotification({
            title: '5TygaEats',
            message: 'There is a new order. Please start Preparing',
            duration: 5000,
          });
        }
      };

      const handleDriverArrived = () => {
        addNotification({
          title: '5TygaEats',
          message: 'The driver has arrived',
          duration: 5000,
        });
      };

      socket.on('newOrder', handleNewOrder);
      socket.on('driverArrived', handleDriverArrived);

      return () => {
        socket.off('driverArrived', handleDriverArrived);
        socket.off('newOrder', handleNewOrder);
      };
    }
  }, [socket]);
};

export default useListenNewOrders;

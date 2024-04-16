import { useSocketContext } from '../context/SocketContext.js';
import { useEffect } from 'react';

const useListenNewOrders = () => {
  const { socket } = useSocketContext();

  useEffect(() => {
    // Already doing this somewhere else
    // Check if the browser supports notifications
    // if (!('Notification' in window)) {
    //   return;
    // }

    // // Request permission for notifications
    // Notification.requestPermission();

    // Listen for 'newOrder' event from socket
    if (socket) {
      const handleNewOrder = (newOrder) => {
        if (newOrder === 'It worked') {
          // Display browser notification
          if (Notification.permission === 'granted') {
            const notification = new Notification('Thabani', {
              body: 'It Worked Please tell Thabani',
            });
            notification();

            // Automatically close the notification after a few seconds
            setTimeout(() => notification.close(), 5000);
          }
        }
        // Display browser notification
        if (Notification.permission === 'granted') {
          const notification = new Notification('5TygaEats', {
            body: 'There is a new order. Please start Preparing',
          });

          // Automatically close the notification after a few seconds
          setTimeout(() => notification.close(), 5000);
        }
      };

      const handleDriverArrived = (arrivedMessage) => {
        console.log('Spmething happened');
        // Display browser notification
        if (Notification.permission === 'granted') {
          const notification = new Notification('5TygaEats', {
            body: 'The driver has Arrived',
          });

          // Automatically close the notification after a few seconds
          setTimeout(() => notification.close(), 5000);
        }
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

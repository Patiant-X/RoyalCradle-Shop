import { useSocketContext } from '../context/SocketContext.js';
import { useEffect } from 'react';
// import addNotification from 'react-push-notification';

const useListenNewOrders = () => {
  const { socket } = useSocketContext();

  // const notify = () => {
  //   addNotification({
  //     title: '5TygaEats',
  //     message: 'There is a new order. Please start Preparing',
  //     duration: 5000,
  //     native: true,
  //   });
  // };
  // const notifyThabani = () => {
  //   addNotification({
  //     title: 'Thabani',
  //     message: 'Please tell Thabani It worked',
  //     duration: 5000,
  //     native: true,
  //   });
  // };
  // const notifyUser = () => {
  //   addNotification({
  //     title: '5TygaEats',
  //     message: 'The driver has arrived',
  //     duration: 5000,
  //     native: true,
  //   });
  // };

  useEffect(() => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      return;
    }

    // Request permission for notifications
    Notification.requestPermission();

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
            // if (newOrder) {
            //   notifyThabani();
            // }

            // Automatically close the notification after a few seconds
            setTimeout(() => notification.close(), 5000);
          }
        }
        // Display browser notification
        if (Notification.permission === 'granted') {
          const notification = new Notification('5TygaEats', {
            body: 'There is a new order. Please start Preparing',
          });
          // if (newOrder) {
          //   notify();
          // }

          // Automatically close the notification after a few seconds
          setTimeout(() => notification.close(), 5000);
        }
      };

      const handleDriverArrived = (arrivedMessage) => {
        // Display browser notification
        if (Notification.permission === 'granted') {
          const notification = new Notification('5TygaEats', {
            body: 'The driver has Arrived',
          });
          // if (arrivedMessage) {
          //   notifyUser();
          // }

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

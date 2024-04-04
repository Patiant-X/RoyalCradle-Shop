import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});
const customerSocketMap = {}; //{userId: socketId}
const restaurantSocketMap = {};
const driverSocketMap = {};
const adminSocketMap = {};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  const userId = socket.handshake.query.userId;
  const userRole = socket.handshake.query.userRole;

  if (userId) {
    if (userRole === 'admin') {
      adminSocketMap[userId] = socket.id;
    }
    if (userRole === 'driver') {
      driverSocketMap[userId] = socket.id;
    } else if (userRole === 'restaurant') {
      restaurantSocketMap[userId] = socket.id;
    } else if (userRole === 'customer') {
      customerSocketMap[userId] = socket.id;
    }
  }

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    if (userId) {
      if (userRole === 'admin') {
        delete adminSocketMap[userId];
      }
      if (userRole === 'driver') {
        delete driverSocketMap[userId];
      } else if (userRole === 'restaurant') {
        delete restaurantSocketMap[restaurantSocketMap];
      } else if (userRole === 'customer') {
        delete customerSocketMap[userId];
      }
    }
  });
});

const getRestaurantSocketId = (restaurantId) => {
  return restaurantSocketMap[restaurantId];
};

export async function notifyNewOrder(restaurantUsers, paymentMethod) {
  try {
    if (restaurantUsers.length > 0) {
      // adminSocketMap is not empty, proceed with the loop
      for (const restUser of restaurantUsers) {
        // Your loop logic here
        io.to(getRestaurantSocketId(restUser.user)).emit(
          'newOrder',
          'new Order'
        );
      }
    }

    if (paymentMethod === 'check') {
      if (Object.keys(adminSocketMap).length > 0) {
        // adminSocketMap is not empty, proceed with the loop
        for (const adminId in adminSocketMap) {
          // Your loop logic here
          io.to(adminSocketMap[adminId]).emit('newOrder', 'It worked');
        }
      }
    }

    // Method 1: Checking the length of the adminSocketMap
    if (Object.keys(adminSocketMap).length > 0) {
      // adminSocketMap is not empty, proceed with the loop
      for (const adminId in adminSocketMap) {
        // Your loop logic here
        io.to(adminSocketMap[adminId]).emit('newOrder', 'new Order');
      }
    }

    if (Object.keys(driverSocketMap).length > 0) {
      // adminSocketMap is not empty, proceed with the loop
      for (const driverId in driverSocketMap) {
        // Your loop logic here
        io.to(driverSocketMap[driverId]).emit('newOrder', 'new Order');
      }
    }
  } catch (error) {
    console.error('Error notifying new order:', error);
  }
}

export async function informUserDriverArrived(userId) {
  try {
    const userSocketId = customerSocketMap[userId];
    if (userSocketId) {
      io.to(userSocketId).emit('driverArrived', 'The driver has arrived for your order');
    } else {
      console.log(`Socket not found for user ${userId}`);
    }
  } catch (error) {
    console.error('Error informing user about driver arrival:', error);
  }
}


export { app, io, server };

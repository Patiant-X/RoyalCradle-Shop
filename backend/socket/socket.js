import { Server } from 'socket.io';
import User from '../models/userModel.js';
import { Conversation, Message } from '../models/conversationModel.js';
import http from 'http';
import https from 'https';
import express from 'express';
import Subscription from '../models/subscriptionModel.js';
import webpush from 'web-push';
import fs from 'fs';

const app = express();

// const key = fs.readFileSync('cert.key');
// const cert = fs.readFileSync('cert.crt');
// const server = https.createServer({ key, cert }, app);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5000',
      'https://royalcradle-shop.onrender.com',
      'https://www.5tygaeats.co.za',
      'https://5tygaeats.co.za'
    ],
    methods: ['GET', 'POST'],
  },
});
const customerSocketMap = {}; //{userId: socketId}
const restaurantSocketMap = {};
const driverSocketMap = {};
const adminSocketMap = {};
const customerNameSocketMap = {};

io.on('connection', async (socket) => {
  const userId = socket.handshake.query.userId;
  const user = await User.findById(userId).select('-password');
  const userRole = user?.roles[0];

  if (user) {
    switch (userRole) {
      case 'admin':
        adminSocketMap[user._id] = socket.id;
        break;
      case 'driver':
        driverSocketMap[user._id] = socket.id;
        break;
      case 'restaurant':
        restaurantSocketMap[user._id] = socket.id;
        break;
      case 'customer':
        customerSocketMap[user._id] = socket.id;
        customerNameSocketMap[user._id] = {
          name: user.name,
          mobileNumber: user.mobileNumber,
        };
        break;
    }
  }
  // Inform admin how many customers there are
  io.emit('onlineCustomers', Object.keys(customerSocketMap));
  io.emit('onlineCustomerNames', customerNameSocketMap);

  socket.on('message-page', async (userId) => {
    const userDetails = await User.findById(userId).select('-password');
    let onlineState = false;
    if (userDetails?.roles[0] === 'admin') {
      onlineState = adminSocketMap[userDetails._id] !== undefined;
    } else if (userDetails?.roles[0] === 'restaurant') {
      onlineState = restaurantSocketMap[userDetails._id] !== undefined;
    } else if (userDetails?.roles[0] === 'customer') {
      onlineState = customerSocketMap[userDetails._id] !== undefined;
    } else if (userDetails?.roles[0] === '') {
      customerSocketMap[userId] !== undefined;
    }

    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      online: onlineState,
    };
    socket.emit('message-user', payload);

    //get previous messages
    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id },
      ],
    })
      .populate('messages')
      .sort({ updatedAt: -1 });
    socket.emit('message', getConversationMessage?.messages || []);
  });

  // New message event handler
  socket.on('new message', async (data) => {
    // Check if conversation exists between both users
    let conversation = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    });

    // If conversation doesn't exist, create a new one
    if (!conversation) {
      const createConversation = new Conversation({
        sender: data?.sender,
        receiver: data?.receiver,
      });
      conversation = await createConversation.save();
    }

    // Create and save the new message
    const message = new Message({
      text: data.text,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      msgByNonUserId: data?.msgByNonUserId, // this informs me which user the message was sent to.
      msgByUserId: data?.msgByUserId,
    });
    const saveMessage = await message.save();

    // Update the conversation with the new message
    await Conversation.updateOne(
      { _id: conversation?._id },
      { $push: { messages: saveMessage?._id } }
    );

    // Retrieve the updated conversation with messages
    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    })
      .populate('messages')
      .sort({ updatedAt: -1 });

    // Emit message to sender
    const senderSocketId =
      customerSocketMap[data?.sender] ||
      restaurantSocketMap[data?.sender] ||
      driverSocketMap[data?.sender] ||
      adminSocketMap[data?.sender];

    if (senderSocketId) {
      io.to(senderSocketId).emit(
        'message',
        getConversationMessage?.messages || []
      );
    }

    // Emit message to receiver
    const receiverSocketId =
      customerSocketMap[data?.receiver] ||
      restaurantSocketMap[data?.receiver] ||
      driverSocketMap[data?.receiver] ||
      adminSocketMap[data?.receiver];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        'message',
        getConversationMessage?.messages || []
      );
      // Emit notification event to receiver
      socket.to(receiverSocketId).emit('notification', {
        message: data.text,
        name: data?.name,
        receiver: message.msgByNonUserId,
        sender: message.msgByUserId,
      });
    }

    // Find the receiver's push subscription
    const userSubscription = await Subscription.findOne({
      userId: data?.receiver,
    });
    if (userSubscription) {
      const notification = {
        title: data.name ? data.name : '5TygaEats',
        body: 'You have a new message',
        // icon: '/path/to/icon.png',
        data: {
          title: 'Driver Arrived',
          message: data.text,
          timestamp: Date.now(),
        },
      };

      console.log(userSubscription);
      // Send push notification
      await webpush
        .sendNotification(
          userSubscription.subscription, // Corrected here
          JSON.stringify(notification)
        )
        .then(() => {
          console.log('Push notification sent successfully');
        })
        .catch((error) => {
          console.error('Error sending push notification:', error);
        });
    } else {
      console.error('No subscription found for user');
    }
  });

  socket.on('offer', (offerData) => {
    const { offer, senderData, receiverData } = offerData;

    const receiverSocketId =
      customerSocketMap[receiverData._id] ||
      restaurantSocketMap[receiverData._id] ||
      driverSocketMap[receiverData._id] ||
      adminSocketMap[receiverData._id];

    if (receiverSocketId) {
      // Emit notification to receiver
      io.to(receiverSocketId).emit('offer', {
        senderData,
        receiverData,
        offer,
      });
    }
  });


  socket.on('answer', (answerData) => {
    const { answer, senderData, receiverData, accepted } = answerData;


    const senderSocketId =
      customerSocketMap[senderData._id] ||
      restaurantSocketMap[senderData._id] ||
      driverSocketMap[senderData._id] ||
      adminSocketMap[senderData._id];

    if (senderSocketId) {
      if (accepted) {
        io.to(senderSocketId).emit('answer', answer);
      } else {
        io.to(senderSocketId).emit('call-rejected', {
          message: `The call was rejected`,
        });
      }
    }
  });

  socket.on('ice-candidate', (candidateData) => {
    const { candidate, receiverData } = candidateData;

    const receiverSocketId =
      customerSocketMap[receiverData._id] ||
      restaurantSocketMap[receiverData._id] ||
      driverSocketMap[receiverData._id] ||
      adminSocketMap[receiverData._id];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('ice-candidate', candidate);
    }
  });

  socket.on('call-ended', (user) => {
    const receiverSocketId =
      customerSocketMap[user._id] ||
      restaurantSocketMap[user._id] ||
      driverSocketMap[user._id] ||
      adminSocketMap[user._id];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call-ended', user);
      }
  })


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
    io.emit('onlineCustomers', Object.keys(customerSocketMap));
    io.emit('onlineCustomerNames', customerNameSocketMap);
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
      io.to(userSocketId).emit(
        'driverArrived',
        'The driver has arrived for your order'
      );
    } else {
      console.log(`Socket not found for user ${userId}`);
    }
  } catch (error) {
    console.error('Error informing user about driver arrival:', error);
  }
}

export { app, io, server };

// import { Server } from 'socket.io';
// import User from '../models/userModel.js';
// import { Conversation } from '../models/conversationModel.js';
// import http from 'http';
// import express from 'express';
// import Subscription from '../models/subscriptionModel.js';
// import webpush from 'web-push';
// import { log } from 'console';

// const app = express();

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: [
//       'http://localhost:5000',
//       'https://8fda-197-184-179-102.ngrok-free.app',
//     ],
//     methods: ['GET', 'POST'],
//   },
// });

// const customerSocketMap = {}; //{userId: socketId}
// const restaurantSocketMap = {};
// const driverSocketMap = {};
// const adminSocketMap = {};

// io.on('connection', async (socket) => {
//   console.log('a user connected', socket.id);

//   const userId = socket.handshake.query.userId;
//   const user = await User.findById(userId).select('-password');
//   const userRole = user?.roles[0];

//   if (user) {
//     switch (userRole) {
//       case 'admin':
//         adminSocketMap[user._id] = socket.id;
//         break;
//       case 'driver':
//         driverSocketMap[user._id] = socket.id;
//         break;
//       case 'restaurant':
//         restaurantSocketMap[user._id] = socket.id;
//         break;
//       case 'customer':
//         customerSocketMap[user._id] = socket.id;
//         break;
//     }
//   }

//   console.log(customerSocketMap, "It's lit");
//   io.emit('onlineCustomers', Object.keys(customerSocketMap));

//   socket.on('message-page', async (userId) => {
//     console.log('userId', userId);
//     const userDetails = await User.findById(userId).select('-password');
//     let onlineState = false;
//     if (userDetails?.roles[0] === 'admin') {
//       onlineState = adminSocketMap[userDetails._id] !== undefined;
//     } else if (userDetails?.roles[0] === 'restaurant') {
//       onlineState = restaurantSocketMap[userDetails._id] !== undefined;
//     } else if (userDetails?.roles[0] === 'customer') {
//       onlineState = customerSocketMap[userDetails._id] !== undefined;
//     }

//     const payload = {
//       _id: userDetails?._id,
//       name: userDetails?.name,
//       email: userDetails?.email,
//       online: onlineState,
//     };
//     socket.emit('message-user', payload);
//   });

//   socket.on('new message', async (data) => {
//     const message = {
//       text: data.text,
//       imageUrl: data.imageUrl,
//       videoUrl: data.videoUrl,
//       msgByUserId: data?.msgByUserId,
//       msgByNonUserID: data?.msgByNonUserID,
//       sender: data?.sender,
//       receiver: data?.receiver,
//       createdAt: new Date().toISOString(),
//     };

//     const senderSocketId =
//       customerSocketMap[data?.sender] ||
//       restaurantSocketMap[data?.sender] ||
//       driverSocketMap[data?.sender] ||
//       adminSocketMap[data?.sender];

//     // if (senderSocketId) {
//     //   io.to(senderSocketId).emit('message', message);
//     // }

//     const receiverSocketId =
//       customerSocketMap[data?.receiver] ||
//       restaurantSocketMap[data?.receiver] ||
//       driverSocketMap[data?.receiver] ||
//       adminSocketMap[data?.receiver];

//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit('message', message);
//       io.to(receiverSocketId).emit('notification', 'You have received a new message');
//     }

//     const userSubscription = await Subscription.findOne({ userId: data?.receiver });
//     if (userSubscription) {
//       const notification = {
//         title: data.name ? data.name : '5TygaEats',
//         body: 'You have a new message',
//         data: {
//           title: 'Driver Arrived',
//           message: data.text,
//           timestamp: Date.now(),
//         },
//       };

//       await webpush.sendNotification(userSubscription.subscription, JSON.stringify(notification))
//         .then(() => {
//           console.log('Push notification sent successfully');
//         })
//         .catch((error) => {
//           console.error('Error sending push notification:', error);
//         });
//     } else {
//       console.error('No subscription found for user');
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('user disconnected', socket.id);
//     if (userId) {
//       if (userRole === 'admin') {
//         delete adminSocketMap[userId];
//       }
//       if (userRole === 'driver') {
//         delete driverSocketMap[userId];
//       } else if (userRole === 'restaurant') {
//         delete restaurantSocketMap[restaurantSocketMap];
//       } else if (userRole === 'customer') {
//         delete customerSocketMap[userId];
//       }
//     }
//   });
// });

// const getRestaurantSocketId = (restaurantId) => {
//   return restaurantSocketMap[restaurantId];
// };

// export async function notifyNewOrder(restaurantUsers, paymentMethod) {
//   try {
//     for (const restUser of restaurantUsers) {
//       io.to(getRestaurantSocketId(restUser.user)).emit('newOrder', 'new Order');
//     }

//     if (paymentMethod === 'check') {
//       for (const adminId in adminSocketMap) {
//         io.to(adminSocketMap[adminId]).emit('newOrder', 'It worked');
//       }
//     }

//     for (const adminId in adminSocketMap) {
//       io.to(adminSocketMap[adminId]).emit('newOrder', 'new Order');
//     }

//     for (const driverId in driverSocketMap) {
//       io.to(driverSocketMap[driverId]).emit('newOrder', 'new Order');
//     }
//   } catch (error) {
//     console.error('Error notifying new order:', error);
//   }
// }

// export async function informUserDriverArrived(userId) {
//   try {
//     const userSocketId = customerSocketMap[userId];
//     if (userSocketId) {
//       io.to(userSocketId).emit('driverArrived', 'The driver has arrived for your order');
//     } else {
//       console.log(`Socket not found for user ${userId}`);
//     }
//   } catch (error) {
//     console.error('Error informing user about driver arrival:', error);
//   }
// }

// export { app, io, server };

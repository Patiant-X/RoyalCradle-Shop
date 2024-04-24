import asyncHandler from '../middleware/asyncHandler.js';
import Subscription from '../models/subscriptionModel.js';
import webpush from 'web-push';
import User from '../models/userModel.js';

// @desc    Send a Notification to user
// @route   POST /api/notification/send-push-notification
// @access  Private
export const sendNotification = asyncHandler(async (req, res) => {
  try {
    // this is the user Id we a sending the notifcation to
    const { userId, notification } = req.body;
    // Retrieve the subscription object associated with the user from the database
    const userSubscription = await Subscription.findOne({ userId });
    if (!userSubscription) {
      res.status(400).json({ error: 'Subscription not found for the user' });
      throw new Error('Subscription not found');
    }

    // Send the push notification using web-push
    console.log(notification);
    await webpush
      .sendNotification(
        userSubscription.subscription,
        JSON.stringify(notification)
      )
      .then(() => console.log('Push notification sent successfully'))
      .catch((error) =>
        console.error('Error sending push notification:', error)
      );
    res.status(200).json({ message: 'Push notification sent successfully' });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @desc    User subscribes to notifications
// @route   POST /api/notification
// @access  Private
export const subscribeNotification = asyncHandler(async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user._id;

    // Check if the user already has this subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      subscription,
    });

    if (existingSubscription) {
      res.status(400).json('Subscription already exists');
      throw new Error('Subscription already exists');
    }

    // Save the new subscription to the database
    await Subscription.create({
      userId,
      subscription,
    });

    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const deleteSubscriptionIfNoOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Retrieve the user's orders from the database
    const userOrders = await Order.find({ user: userId });

    // Check if any order meets the conditions for not deleting the subscription
    const shouldDeleteSubscription = userOrders.some((order) => {
      // Check if the order is paid and not delivered yet
      if (order.paymentMethod === 'card' && !order.isDelivered) {
        return false; // Do not delete the subscription
      }

      // Check if the order is not delivered yet and paid with cash
      if (!order.isDelivered && order.paymentMethod === 'cash') {
        return false; // Do not delete the subscription
      }

      return true; // Delete the subscription if no orders meet the conditions
    });

    // If shouldDeleteSubscription is true, delete the subscription
    if (shouldDeleteSubscription) {
      await Subscription.findOneAndDelete({ userId });
      res.status(200).json({ message: 'Subscription deleted successfully' });
    } else {
      res.status(400).json({ message: 'Subscription not deleted' });
    }
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const sendRestaurantNotification = asyncHandler(
  async (restaurantUsers, clientName) => {
    try {
      const notification = {
        title: '5TygaEats',
        body: 'You have a new message',
        // icon: '/path/to/icon.png',
        data: {
          title: 'New Order',
          message: `You have received a new order from ${clientName}`,
          timestamp: Date.now(),
        },
      };
      // Iterate over each restaurant user and send a notification
      for (const restaurantUser of restaurantUsers) {
        const userSubscription = await Subscription.findOne({
          userId: restaurantUser.user,
        });
        if (userSubscription) {
          await webpush.sendNotification(
            userSubscription.subscription,
            JSON.stringify(notification)
          );
        }
      }

      console.log('Restaurant notifications sent successfully');
    } catch (error) {
      console.error('Error sending restaurant notifications:', error);
    }
  }
);

export const sendDriverNotification = asyncHandler(async (order) => {
  try {
    const notification = {
      title: '5TygaEats',
      body: 'You have a new message',
      // icon: '/path/to/icon.png',
      data: {
        title: 'New Order',
        message: `There is a new Order`,
        timestamp: Date.now(),
      },
    };

    const driverUsers = await User.find({ roles: 'driver' });

    // Iterate over each driver user and send a notification
    for (const driverUser of driverUsers) {
      const userSubscription = await Subscription.findOne({
        userId: driverUser._id,
      });
      if (userSubscription) {
        await webpush.sendNotification(
          userSubscription.subscription,
          JSON.stringify(notification)
        );
      }
    }

    console.log('Driver notifications sent successfully');
  } catch (error) {
    console.error('Error sending driver notifications:', error);
  }
});

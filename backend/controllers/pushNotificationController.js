import asyncHandler from '../middleware/asyncHandler.js';
import Subscription from '../models/subscriptionModel.js';
import Joi from 'joi';
import webpush from 'web-push';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

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

    // Validate the subscription object
    const { error } = validateSubscription(subscription);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find existing subscription for the user
    let existingSubscription = await Subscription.findOne({ userId });

    if (existingSubscription) {
      // If subscription already exists, update it with the new subscription
      existingSubscription.subscription = subscription;
      await existingSubscription.save();
      return res
        .status(200)
        .json({ message: 'Subscription updated successfully' });
    }

    // Save the new subscription to the database
    await Subscription.create({ userId, subscription });

    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Utility function to validate the subscription object
export const validateSubscription = (subscription) => {
  const schema = Joi.object({
    endpoint: Joi.string().uri().required(),
    expirationTime: Joi.any(),
    keys: Joi.object({
      p256dh: Joi.string().required(),
      auth: Joi.string().required(),
    }).required(),
  }).unknown(true);

  return schema.validate(subscription);
};

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
      return true;
    } else {
      return true;
    }
  } catch (error) {
    return true;
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

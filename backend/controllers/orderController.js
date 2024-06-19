import moment from 'moment-timezone';
import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Restaurant from '../models/restaurantModel.js';
import SendEmail from '../utils/SendEmail.js';
import { calcPrices } from '../utils/calcPrices.js';
import { OrderConfirmationContent } from '../utils/emailContents.js';
import { makeYocoPayment, registerYocoWebHook } from '../utils/yoco.js';
import { informUserDriverArrived, notifyNewOrder } from '../socket/socket.js';
import {
  sendDriverNotification,
  sendRestaurantNotification,
} from './pushNotificationController.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!['card', 'cash'].includes(paymentMethod)) {
    res.status(400).json({ error: 'Invalid payment method' });
    throw new Error('Invalid payment method');
  }
  if (!orderItems || orderItems.length === 0) {
    res.status(400).json({ error: 'No order item' });
    throw new Error('No order items');
  }

  try {
    // NOTE: here we must assume that the prices from our client are incorrect.
    // We must only trust the price of the item as it exists in
    // our DB. This prevents a user paying whatever they want by hacking our client
    // side code - https://gist.github.com/bushblade/725780e6043eaf59415fbaf6ca7376ff

    // get the ordered items from our database
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });

    const restaurantProductIds = [];

    // map over the order items and use the price from our items from database
    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );
      restaurantProductIds.push(itemFromClient._id);
      return {
        ...itemFromClient,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        _id: undefined,
      };
    });
    // calculate prices
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(
      dbOrderItems,
      shippingAddress
    );

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress: {
        address: shippingAddress.location,
        latitude: shippingAddress.lat ? shippingAddress.lat : '',
        longitude: shippingAddress?.lng ? shippingAddress?.lng : '',
        delivery: shippingAddress.delivery,
      },
      paymentMethod,
      isPaid: paymentMethod === 'cash',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });
    const createdOrder = await order.save();

    const restaurantUsers = await Product.find({
      _id: { $in: restaurantProductIds.map((x) => x) },
    }).select('user');

    if (createdOrder.paymentMethod === 'card') {
      const resYoco = await makeYocoPayment(createdOrder);

      createdOrder.checkoutId = resYoco.id;
      await createdOrder.save();

      // Extracting id and redirectUrl from resYoco
      const { redirectUrl } = resYoco;

      notifyNewOrder(restaurantUsers, createdOrder.paymentMethod);
      sendRestaurantNotification(restaurantUsers, req.user.name);
      sendDriverNotification(createdOrder);

      // Responding with only id and redirectUrl
      return res.status(200).json({ redirectUrl });
    }

    notifyNewOrder(restaurantUsers, createdOrder.paymentMethod);
    sendRestaurantNotification(restaurantUsers, req.user.name);
    sendDriverNotification(createdOrder);

    res.status(201).json(createdOrder);
  } catch (error) {
    console.log(`${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email mobileNumber roles')
      .populate('driver', 'name email mobileNumber');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    // NOTE: here we need to verify the payment was made to Yoco before marking
    // the order as paid
    const { type, payload } = req.body;

    const orderId = payload.metadata.orderId;
    const value = payload.amount;
    const checkoutId = payload.metadata.checkoutId;
    const order = await Order.findById(orderId).populate(
      'user',
      'name email mobileNumber'
    );
    if (!order) {
      // Order not found, send a response with success status to resolve the webhook
      return res.status(200).send('Order not found');
    }

    if (type != 'payment.succeeded' || checkoutId != order.checkoutId) {
      // If the event type is not 'payment.succeeded' or the id does not match the checkoutId,
      // send a response with success status to resolve the webhook
      return res.status(200).send('Invalid payment event');
    }

    // check the correct amount was paid
    if ((order.totalPrice * 100).toFixed(0) != value) {
      return res.status(200).send('Incorrect amount paid');
    }

    // Update the order status
    order.isPaid = true;
    order.paidAt = moment().format();
    order.paymentResult = {
      id: payload.metadata.checkoutId,
      status: payload.status,
      update_time: req.body.createdDate,
      email_address: payload.metadata.email_address,
    };

    const state = true;
    const emailContent = OrderConfirmationContent(order);
    SendEmail(
      res,
      order.user.email,
      emailContent.message,
      emailContent.subject,
      state
    );

    // Save the updated order to the database
    await order.save();

    // Notify restaurant users about the new order
    const restaurantUsers = await Product.find({
      _id: { $in: order.orderItems.map((item) => item.product) },
    }).select('user');

    notifyNewOrder(restaurantUsers, 'card');
    sendRestaurantNotification(restaurantUsers, order.user.name);
    sendDriverNotification(order);
    res.send(200);
  } catch (error) {
    res.send(200);
  }
});

// @desc   Refund Order
// @route  PUT /api/orders/:id/refundorder
// @access Private/admin
const refundOrderYoco = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    try {
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

/**
 * Register WebHook with Yoco.
 * @see {@link https://payments.yoco.com/api/webhooks}
 *
 * @returns {Promise<Object>} An object containing the response data from Yoco.
 * @throws {Error} If the webhook registration fails.
 *
 */
const registerWebHookYoco = asyncHandler(async (req, res) => {
  try {
    // Register the webhook with Yoco
    const response = await registerYocoWebHook();

    // Send the response data back to the client
    res.status(200).json(response);
  } catch (error) {
    // Handle any errors that occur during webhook registration
    res.status(500).json({ error: error.message });
  }
});

// @desc    Accept order by driver
// @route   PUT /api/orders/:id/accept
// @access  Private/Driver
const acceptOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const driverId = req.user._id;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.driver && order.driver.toString() !== driverId.toString()) {
    return res.status(400).json({ error: 'Order already Picked by driver' });
  }

  if (order.isPaid && order.driver && order.driverAccepted) {
    return res
      .status(400)
      .json({ message: 'You have already Picked up the order' });
  } else if (order.isPaid) {
    order.driver = driverId;
    order.driverAccepted = true;
  } else {
    res.status(400).json({ error: 'Order is not paid' });
    throw new Error('Order is not paid');
  }

  await order.save();

  res.status(200).json({ message: 'Order Picked up successfully' });
});
// @desc    Restaurant order confirmation
// @route   PUT /api/orders/:id/confirm
// @access  Private/restaurant
const confirmOrder = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const restaurantUserId = req.user._id;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Find the restaurant by the restaurant ID in the order
    const restaurant = await Restaurant.findOne({ user: order?.restaurant });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Check if the current user is associated with the restaurant
    if (restaurant.user.toString() !== restaurantUserId.toString()) {
      return res
        .status(403)
        .json({ error: 'User not authorized to confirm this order' });
    }

    // Check if the order has already been confirmed by the restaurant
    if (order.restaurantConfirmation) {
      return res.status(400).json({ error: 'Order already confirmed' });
    }

    // Confirm the order
    order.restaurantConfirmation = true;
    await order.save();

    res.status(200).json({ message: 'Order confirmed successfully' });
  } catch (error) {
    // Handle any unexpected errors
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Driver arrived at delivery location
// @route   PUT /api/orders/:id/arrived
// @access  Private/Driver
const driverArrivedOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const driverId = req.user._id;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.driver && order.driver.toString() !== driverId.toString()) {
    return res.status(400).json({ error: 'Order assigned to another driver' });
  }

  if (!order.driverAccepted) {
    return res
      .status(400)
      .json({ error: 'Driver has not accepted the order yet' });
  }

  // Update driverArrived field to true
  order.driverArrived = true;

  // await order.save();

  informUserDriverArrived(order.user);

  res.status(200).json({ message: 'Driver arrived at delivery location' });
});

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email mobileNumber'
  );

  if (order) {
    if (order.paymentMethod === 'cash') {
      order.paidAt = Date.now();
      const state = true;
      const emailContent = OrderConfirmationContent(order);
      SendEmail(
        res,
        order.user.email,
        emailContent.message,
        emailContent.subject,
        state
      );
    }
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404).json({ error: 'Order not found' });
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin/Driver
const getOrders = asyncHandler(async (req, res) => {
  try {
    if (req.user.roles[0] === 'restaurant') {
      const orders = await Order.find({}).populate({
        path: 'driver',
        select: 'name email mobileNumber',
        match: { driverAccepted: true },
      });
      const productRestaurantId = await Product.find({
        user: req.user._id,
      }).select('_id');

      if (productRestaurantId && orders) {
        if (productRestaurantId && orders) {
          for (let i = orders.length - 1; i >= 0; i--) {
            let orderContainsValidProduct = false;
            for (let k = 0; k < orders[i].orderItems.length; k++) {
              if (
                productRestaurantId.some((product) =>
                  product.equals(orders[i].orderItems[k].product)
                )
              ) {
                orderContainsValidProduct = true;
                break;
              }
            }
            if (!orderContainsValidProduct) {
              orders.splice(i, 1);
            }
          }
        }
        return res.status(200).json(orders);
      }
    }
    const orders = await Order.find({}).populate('user', 'id name roles').sort({
      updatedAt: -1,
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Delete an order
// @route   DELETE /api/oders/:id
// @access  Private
const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (order) {
      await Order.deleteOne({ _id: order._id });
      return res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ error: 'Order not found' });
      throw new Error('Order not found');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  registerWebHookYoco,
  confirmOrder,
  deleteOrder,
  acceptOrder,
  driverArrivedOrder,
};

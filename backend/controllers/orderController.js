import moment from 'moment-timezone';
import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import SendEmail from '../utils/SendEmail.js';
import { calcPrices } from '../utils/calcPrices.js';
import { OrderConfirmationContent } from '../utils/emailContents.js';
import { makeYocoPayment, registerYocoWebHook } from '../utils/yoco.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;
  if (paymentMethod !== 'card' && paymentMethod !== 'cash') {
    res.status(400).json({ error: 'Invalid payment method' });
    throw new Error('Invalid payment method');
  }
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
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

    // map over the order items and use the price from our items from database
    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );
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
        latitude: shippingAddress.lat,
        longitude: shippingAddress.lng,
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
    res.status(201).json(createdOrder);
  } catch (error) {
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
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email mobileNumber roles'
    );
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
    order.paidAt =  moment().format();
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
    res.send(200);
  } catch (error) {
    res.send(200);
  }
});

// @desc   Pay order  using yoco, and update checkoutId
// @route  PUT /api/orders/:id/payorder
// @access Private
const payOrderYoco = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    try {
      const resYoco = await makeYocoPayment(order);

      order.checkoutId = resYoco.id;
      await order.save();

      // Extracting id and redirectUrl from resYoco
      const { redirectUrl } = resYoco;

      // Responding with only id and redirectUrl
      res.json({ redirectUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: 'Order not found' });
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
// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.paymentMethod === 'cash') {
      order.paidAt = Date.now();
    }
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin/Driver
const getOrders = asyncHandler(async (req, res) => {
  try {
    if (req.user.roles[0] === 'restaurant') {
      const orders = await Order.find({});
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
      res.status(404);
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
  payOrderYoco,
  registerWebHookYoco,
  deleteOrder,
};

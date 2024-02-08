import dotenv from 'dotenv';
dotenv.config();
const { YOCO_TEST_SECRET_KEY, YOCO_API_URL, YOCO_REGISTER_WEBHOOK_API_URL } =
  process.env;
import { v4 as uuidv4 } from 'uuid';

/**
 * Make a payment by making a request to the YOCO Checkout API LIbrary.
 * @see {@link https://payments.yoco.com/api/checkouts}
 *
 * @param {Order} - The object containing user order.
 * @returns {Promise<Object>} An object with properties eg. redirectUrl which users will use to complete payment.
 * @throws {Error} If the payment is not successful.
 *
 */
export async function makeYocoPayment(order) {
  if (!order.isPaid) {
    try {
      // Generate a unique idempotency key
      const idempotencyKey = uuidv4();
      const amount = (order.totalPrice * 100).toFixed(0); // Convert total price to cents
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${YOCO_TEST_SECRET_KEY}`,
        'Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json', // Add Content-Type header
      };
  
      // // Construct lineItems array
      // const lineItems = order.orderItems.map((item) => ({
      //   displayName: item.name,
      //   quantity: item.qty,
      //   pricingDetails: {
      //     price: (item.price * 100).toFixed(0),
      //   },
      // }));
    
      const body = JSON.stringify({
        amount: amount,
        currency: 'ZAR',
        successUrl: `https://royalcradle-shop.onrender.com/order/${order._id}`,
        cancelUrl: `https://royalcradle-shop.onrender.com/order/${order._id}`,
        failureUrl: `https://royalcradle-shop.onrender.com/order/${order._id}`,
        metadata: {
          orderId: order._id,
          userId: order.user,
        }
      });
  
      const response = await fetch(YOCO_API_URL, {
        method: 'POST',
        headers,
        body,
      });
  
      if (!response.ok) {
        throw new Error('Failed to make payment');
      }
  
      const responseData = await response.json(); // Parse JSON response
      return responseData;
    } catch (error) {
      throw new Error(`Failed to make payment: ${error.message}`);
    }
  }else {
    throw new Error('Order already Paid');
  }
  
}


/**
 * Refund Order by making a request to the YOCO Checkout API LIbrary.
 * @see {@link https://payments.yoco.com/api/checkouts/{id}/refund}
 *
 * @param {Order} - The object containing user order.
 * @returns {Promise<Object>} An object with properties id, refundId, message, status.
 * @throws {Error} If the refund is not successful.
 *
 */
export async function refundYocoPayment(order) {
  if (order.isPaid) {
    try {
      // Generate a unique idempotency key
      const idempotencyKey = uuidv4();
      const amount = (order.totalPrice * 100).toFixed(0); // Convert total price to cents
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${YOCO_TEST_SECRET_KEY}`,
        'Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json', // Add Content-Type header
      };
  
      const body = JSON.stringify({
        amount: amount,
        currency: 'ZAR',
        successUrl: `https://royalcradle-shop.onrender.com/order/${order._id}/`,
        cancelUrl: `https://royalcradle-shop.onrender.com/order/${order._id}/`,
        failureUrl: `https://royalcradle-shop.onrender.com/order/${order._id}/`,
        metadata: {
          orderId: order._id,
          email_address: order.user.email,
        }
      });
  
      const response = await fetch(YOCO_API_URL, {
        method: 'POST',
        headers,
        body,
      });
  
      if (!response.ok) {
        throw new Error('Failed to make payment');
      }
  
      const responseData = await response.json(); // Parse JSON response
      return responseData;
    } catch (error) {
      throw new Error(`Failed to make payment: ${error.message}`);
    }
  }else {
    throw new Error('Order has not been paid');
  }
  
}


/**
 * Register a webhook to verify Yoco payment by making a request to the Yoco API.
 * @see {@link https://payments.yoco.com/api/webhooks}
 *
 *@returns {Promise<Object>} An object with properties 'id', 'name', 'url', 'mode', and 'secret' representing the registered webhook.
 * throws {Error} If the request is not successful.
 *
 */
export async function registerYocoWebHook() {
  try {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${YOCO_TEST_SECRET_KEY}`,
      'Content-Type': 'application/json', // Content-Type header
    };

    const body = JSON.stringify({
      name: '5tyga-webhook',
      url: 'https://royalcradle-shop.onrender.com/my/webhook/url',
    });

    const response = await fetch(YOCO_REGISTER_WEBHOOK_API_URL, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to register webhook');
    }

    const responseData = await response.json(); // Parse JSON response
    return responseData;
  } catch (error) {
    throw new Error(`Failed to register webhook: ${error.message}`);
  }
}



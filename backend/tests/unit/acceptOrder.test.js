const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Order = require('../../models/orderModel');
const {
  setupTestDB,
  teardownTestDB,
} = require('../../tests/unit/test-db-setup');

const app = express();

const driverId = mongoose.Types.ObjectId();

describe('Accept Order Endpoint', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  fterAll(async () => {
    await teardownTestDB();
  });

  it('should accept an order by a driver', async () => {
    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      driver: null,
    });

    await order.save();

    // Mock authenticated user
    const authenticatedUser = { _id: driverId };

    // Perform a request to accept order
    const res = await request(app)
      .put('/api/orders/${order._id}/accept')
      .set(
        'Authorization',
        `Bearer ${eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWUxYjI4NGM3OTBlMjViYzFiZDMzYmIiLCJpYXQiOjE3MDkyOTI0NTgsImV4cCI6MTcxMTg4NDQ1OH0.in6AH5ZW7ZUL25LygJReR5fFNoanrzkpGXs0aFFbjUI}`
      )
      .send()
      .expect(200);

    // Check if order is updated successfully
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.driver.toString()).toEqual(driverId.toString());
    expect(updatedOrder.driverAccepted).toEqual(true);
  });
});

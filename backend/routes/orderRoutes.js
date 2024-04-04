import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  getOrders,
  deleteOrder,
  acceptOrder,
  driverArrivedOrder,
} from '../controllers/orderController.js';
import {
  protect,
  adminDriver,
  adminDriverRestaurant,
} from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';

router
  .route('/')
  .post(protect, addOrderItems)
  .get(protect, adminDriverRestaurant, getOrders);
router.route('/mine').get(protect, getMyOrders);
router.route('/deleteorder').delete(protect, deleteOrder);
router.route('/:id').get(protect, getOrderById);
router
  .route('/:id/deliver')
  .put(protect, checkObjectId, adminDriver, updateOrderToDelivered);
router
  .route('/:id/collect')
  .put(protect, checkObjectId, adminDriver, acceptOrder);
router
  .route('/:id/arrive')
  .put(protect, checkObjectId, adminDriver, driverArrivedOrder);

export default router;

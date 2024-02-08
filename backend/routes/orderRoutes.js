import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  getOrders,
  payOrderYoco,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/mine').get(protect, getMyOrders);
router.route('/deleteorder').delete(protect, deleteOrder);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/payorder').put(protect, payOrderYoco);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;

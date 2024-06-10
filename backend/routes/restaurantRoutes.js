import express from 'express';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantById,
  deleteRestaurantById,
} from '../controllers/restaurantController.js';
import { protect, adminRestaurant, admin } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';

const router = express.Router();

// Routes with middleware
router.route('/')
  .post(protect, adminRestaurant, createRestaurant)
  .get(getAllRestaurants);

router.route('/:id')
  .get(protect, checkObjectId, getRestaurantById)
  .put(protect, adminRestaurant, checkObjectId, updateRestaurantById)
  .delete(protect, adminRestaurant, checkObjectId, deleteRestaurantById);

export default router;

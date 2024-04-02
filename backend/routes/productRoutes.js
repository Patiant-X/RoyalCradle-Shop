import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getRestaurantProduct,
} from '../controllers/productController.js';
import { protect, adminRestaurant } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';

router
  .route('/')
  .get(getProducts)
  .post(protect, adminRestaurant, createProduct);
router.get('/restaurant', protect, adminRestaurant, getRestaurantProduct);
router.route('/:id/reviews').post(protect, checkObjectId, createProductReview);
router.get('/top', getTopProducts);
router
  .route('/:id')
  .get(checkObjectId, getProductById)
  .put(protect, adminRestaurant, checkObjectId, updateProduct)
  .delete(protect, adminRestaurant, checkObjectId, deleteProduct);

export default router;

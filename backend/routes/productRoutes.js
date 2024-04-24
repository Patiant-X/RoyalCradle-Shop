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
  updateAllProductsToAvailable,
  updateAllProductsToNotAvailable,
} from '../controllers/productController.js';
import {
  protect,
  adminRestaurant,
  admin,
} from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';

router
  .route('/')
  .get(getProducts)
  .patch(protect, admin, updateAllProductsToAvailable);
router.patch('/notavailable', protect, admin, updateAllProductsToNotAvailable);
router.get('/restaurant', protect, adminRestaurant, getRestaurantProduct);
router.route('/:id/reviews').post(protect, checkObjectId, createProductReview);
router.get('/top', getTopProducts);
router
  .route('/:id')
  .get(checkObjectId, getProductById)
  .put(protect, adminRestaurant, checkObjectId, updateProduct)
  .delete(protect, admin, checkObjectId, deleteProduct)
  .post(protect, admin, createProduct);

export default router;

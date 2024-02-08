import express from 'express';
const router = express.Router();
import { updateOrderToPaid } from '../controllers/orderController.js';
import { webhookSecret } from '../middleware/webhookCheckoutId.js';


router.route('/').post(webhookSecret, updateOrderToPaid );

export default router;

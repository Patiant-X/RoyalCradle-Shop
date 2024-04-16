import express from 'express';
import { sendNotification, subscribeNotification } from '../controllers/pushNotificationController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/').post(protect, subscribeNotification);
router.route('/send-push-notification').post(protect, sendNotification);

export default router;

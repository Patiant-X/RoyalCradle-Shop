import express from 'express';
const router = express.Router();
import {
  registerWebHookYoco,
} from '../controllers/orderController.js';

router.get("/", registerWebHookYoco);
export default router;

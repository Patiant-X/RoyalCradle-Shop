import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { parseRawRequestBody } from './middleware/webhookCheckoutId.js';
dotenv.config();
const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,  EMAIL_USER } =
  process.env;
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import yocoWebHookRoutes from './routes/yocoWebHookRoutes.js';
import yocoVerifyPaymentRoutes from './routes/yocoVerifyPaymentRoutes.js';
import pushNotificationRoute from './routes/pushNotificationRoute.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { app, server } from './socket/socket.js';
import webpush from 'web-push';

const port = process.env.PORT || 5000;

connectDB();

//const app = express();

const vapidKeys = {
  publicKey:
    'BG0BzgeISwE7My_Sue8MTDdtSYdEPCemUYpmbbmcSFtquayfifnmzx-OlsUBwh6cvOuBh62xYFbXUdgLyVoUQvA',

  privateKey: '6tefQq9C66-tYKLIoRrQECA-bo-Cwx8tbE68eYjg84s',
};

// Set up VAPID keys
webpush.setVapidDetails(
  'mailto:ngwenyathabani080@gmai.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.use(parseRawRequestBody);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/my/webhook/url', yocoVerifyPaymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notification', pushNotificationRoute)
app.use('/api/restaurant', restaurantRoutes)


// Execute once to get secret and store secret in env file
// Commented out for security reasons
app.use('/webhook/register', yocoWebHookRoutes);

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  // app.use('/uploads', express.static('/var/data/uploads'));
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  const __dirname = path.resolve();
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

server.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);

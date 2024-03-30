import mongoose from 'mongoose';
import moment from 'moment-timezone'; 

const locationSchema = mongoose.Schema({
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});
const shippingSchema = mongoose.Schema({
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  delivery: { type: Boolean, required: true },
});

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    driverAccepted : {
      type : Boolean,
      default: false,
    }
    ,
    checkoutId: {
      type: String,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        IsFood: {type: Boolean, required: true},
        additionalInfo: {type: String, default : 'Customer did not provide any.'},
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        location: {
          type: locationSchema,
          required: true,
        },
      },
    ],
    shippingAddress: {
      type: shippingSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


// Define pre-save hook to update timestamps with South African time
orderSchema.pre('save', function (next) {
  if (this.isPaid && !this.paidAt) {
    this.paidAt = moment().format();
  }
  if (this.isDelivered && !this.deliveredAt) {
    this.deliveredAt = moment().format();
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;

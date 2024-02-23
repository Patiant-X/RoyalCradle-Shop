import mongoose from 'mongoose';
import moment from 'moment-timezone';

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const locationSchema = mongoose.Schema({
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    IsFood: {
      type: Boolean,
      required: true,
      default: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    productIsAvailable: {
      type: Boolean,
      required: true,
      default: false,
    },
    location: {
      type: locationSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define pre-save hook to update timestamps with South African time
productSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = moment().tz('Africa/Johannesburg').toDate();
  }
  if (!this.updatedAt) {
    this.updatedAt = moment().tz('Africa/Johannesburg').toDate();
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;

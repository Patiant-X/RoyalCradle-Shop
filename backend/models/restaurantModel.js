import mongoose from 'mongoose';

const locationSchema = mongoose.Schema({
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const operatingHoursSchema = new mongoose.Schema({
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
  daysOpen: { type: [String], required: true }, // Add this line
});

const restaurantSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter the restaurant name'],
  },
  cuisine: [
    {
      type: String,
      required: true,
    },
  ],
  image: {
    type: String,
    required: true,
  },
  operatingHours: { type: operatingHoursSchema, required: true },
  paymentMethods: {
    type: [
      {
        type: String,
        enum: ['card', 'cash'],
      },
    ],
    required: true,
  },
  deliveryOptions: {
    type: [
      {
        type: String,
        enum: ['delivery', 'collection'],
      },
    ],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: locationSchema,
    required: true,
  },
  restaurantMedia: {
    type: {
      team: { type: String, required: false },
      quote: { type: String, required: false },
      video: { type: String, required: false },
    },
    required: true,
  },
  menuPictures: {
    type: Object,
    required: true,
  },
  aboutPodcast: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'suspended'],
    default: 'closed',
    required: true,
  },
  // You can add more fields specific to restaurants here
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;

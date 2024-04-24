import mongoose from 'mongoose';

const locationSchema = mongoose.Schema({
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
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
  // foods: [
  //   {
  //     type: String,
  //     required: true,
  //   },
  // ],
  image: {
    type: String,
    required: true,
  },
  operatingHours: {
    type: {
      openingTime: String,
      closingTime: String,
    },
    required: true,
  },
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
  },
  location: {
    type: locationSchema,
    required: true,
  },
  // You can add more fields specific to restaurants here
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;

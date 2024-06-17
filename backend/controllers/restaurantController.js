import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import Restaurant from '../models/restaurantModel.js';
import { calculateUserDistance } from '../utils/calculateDeliveryDistanceFee.js';

// @desc    Create a restaurant profile
// @route   POST /api/restaurant
// @access  Private
const createRestaurant = asyncHandler(async (req, res) => {
  try {
    // Extract user ID from req.user
    const userId = req.user._id;

    // Append user ID to restaurant data
    const restaurantData = { ...req.body, user: userId };

    // Create the restaurant
    const restaurant = await Restaurant.create(restaurantData);
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to create new Restaurant' });
  }
});

// @desc    Get all restaurants
// @route   Get /api/restaurant
// @access  Public
const getAllRestaurants = asyncHandler(async (req, res) => {
  const pageSize = parseInt(process.env.PAGINATION_LIMIT, 10) || 10;
  const page = parseInt(req.query.pageNumber, 10) || 1;
  const { latitude, longitude, state } = req.query;
  const keyword = req.query.keyword ? req.query.keyword : '';
  const cuisine = req.query.cuisine ? req.query.cuisine : '';

  // Special case: return only the restaurant with the specific ID
  const specificRestaurantId = '6625be557e9562917044d452';

  // if (specificRestaurantId) {
  //   try {
  //     const restaurant = await Restaurant.findById(specificRestaurantId)
  //       .populate({ path: 'user', select: '_id restaurant name' });

  //     if (!restaurant) {
  //       return res.status(404).json({ success: false, message: 'Restaurant not found' });
  //     }
  //     return res.status(200).json({ success: true, data: restaurant });
  //   } catch (error) {
  //     console.error('Error getting specific restaurant:', error);
  //     return res.status(500).json({ success: false, message: 'Internal server error' });
  //   }
  // }

  // Merge keyword and cuisine filters
  const filters = {};

  // Check if keyword is provided
  if (keyword) {
    const regex = new RegExp(keyword, 'i');
    filters.name = regex;
  }

  // Check if cuisine is provided
  if (cuisine) {
    filters.cuisine = { $regex: new RegExp(cuisine, 'i') };
  }

  let count;
  let restaurants;

  if (req.query.keyword) {
    let products = await Product.find(filters)
      .populate({ path: 'user', select: '_id restaurant name' })
      .sort({ IsFood: -1, rating: -1, numReviews: -1 });

    const productsOutOfRange = products;

    // If latitude and longitude are provided, filter products based on distance
    if (
      latitude !== null &&
      !isNaN(latitude) &&
      longitude !== null &&
      !isNaN(longitude)
    ) {
      // Filter products within the desired radius from the user's location
      products = products.filter((product) => {
        const productDistance = calculateUserDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(product.location.latitude),
          parseFloat(product.location.longitude)
        );
        return productDistance <= 4; // Adjust the radius as needed
      });

      // Filter out duplicates between products within radius and all products
      const uniqueProducts = productsOutOfRange.filter(
        (product) =>
          !products.some((pr) => pr._id.toString() === product._id.toString())
      );

      // Concatenate products within radius and unique products from all products
      const mergedProducts = [...products, ...uniqueProducts];

      const userIds = mergedProducts.map((product) =>
        product.user._id.toString()
      );

      //let counts = await Restaurant.countDocuments({ user: { $in: userIds } });

      // Use user IDs to find the associated restaurants
      restaurants = await Restaurant.find({ user: { $in: userIds } })
        .populate({ path: 'user', select: '_id restaurant name' })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
    }
  } else {
    count = await Restaurant.countDocuments(filters);

    restaurants = await Restaurant.find(filters)
      .populate({ path: 'user', select: '_id restaurant name' })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    // Filter products within the desired radius from the user's location
    if (
      latitude !== null &&
      !isNaN(latitude) &&
      longitude !== null &&
      !isNaN(longitude) &&
      state
    ) {
      restaurants.sort((a, b) => {
        const distanceA = calculateUserDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(a.location.latitude),
          parseFloat(a.location.longitude)
        );

        const distanceB = calculateUserDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(b.location.latitude),
          parseFloat(b.location.longitude)
        );

        // Sort in ascending order based on distance
        return distanceA - distanceB;
      });
    }
  }
  restaurants = restaurants.sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') {
      return -1;
    }
    if (a.status !== 'open' && b.status === 'open') {
      return 1;
    }
    return 0;
  });  
  res
    .status(200)
    .json({ restaurants, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get a restaurant profile
// @route   Get /api/restaurant
// @access  admin/Restaurants
const getRestaurantById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: 'Restaurant not found' });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Error getting restaurant by ID:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @desc    Update a restaurant profile
// @route   PUT /api/restaurant
// @access  admin/Restaurant
const updateRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: 'Restaurant not found' });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// @desc    Delete a restaurant profile
// @route   Del /api/restaurant
// @access  admin
const deleteRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: 'Restaurant not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant by ID:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantById,
  deleteRestaurantById,
};

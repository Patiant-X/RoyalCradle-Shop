import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import dotenv from 'dotenv';
dotenv.config();
const { PAGINATION_LIMIT } = process.env;
import { calculateUserDistance } from '../utils/calculateDeliveryDistanceFee.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = null;
  const page = Number(req.query.pageNumber) || 1;
  const { latitude, longitude } = req.query;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  //Check if category is supplied in the request
  const category = req.query.category
    ? {
        category: {
          $regex: req.query.category,
          $options: 'i',
        },
      }
    : {};

  // Merge keyword and category filters
  const filters = { ...category, ...keyword };

  let count = await Product.countDocuments(filters);
  let products = await Product.find(filters)
    .populate('user', '-password')
    .sort({ IsFood: -1, rating: -1, numReviews: -1, productIsAvailable: true }) // Sort in descending order by IsFood, rating, and numReviews
    .limit(pageSize)
    .skip(pageSize * (page - 1));
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

    if (req.query.keyword) {
      // Filter out duplicates between products within radius and all products
      const uniqueProducts = productsOutOfRange.filter(
        (product) =>
          !products.some((pr) => pr._id.toString() === product._id.toString())
      );
      // Concatenate products within radius and unique products from all products
      let mergedProducts = [...products, ...uniqueProducts];

      if (req.query.restaurant) {
        mergedProducts = mergedProducts.filter(
          (product) => product.user._id.toString() === req.query.restaurant
        );
      }
      count = mergedProducts.length;
      res.json({
        products: mergedProducts,
        page,
        pages: Math.ceil(count / pageSize),
      });
      return;
    }

    if (products.length === 0) {
      products = productsOutOfRange;
    }
  }

  if (req.query.restaurant === 'restaurantList') {
    // Define and initialize productsWithUsers
    let productsWithUsers = [];
    let userWithPriority = null;

    // Iterate over each product
    products.forEach((product) => {
      let shimicas = '6619ce401336f81b75d91686';
      let theFoodiee = '65fdb14cc20aa1ee82444ef2';
      // Check if the current product belongs to the user with the specified ID
      if (product.user._id.toString() === theFoodiee) {
        // Set the user with priority
        if (
          !userWithPriority ||
          product.rating > userWithPriority.product.rating
        ) {
          userWithPriority = {
            product: product,
            user: product.user,
          };
        }
      } else {
        // Find the index of the user in productsWithUsers array
        const existingUserIndex = productsWithUsers.findIndex(
          (p) => p.user._id.toString() === product.user._id.toString()
        );

        // If the user already exists in productsWithUsers
        if (existingUserIndex !== -1) {
          // Check if the current product has a higher rating
          if (
            productsWithUsers[existingUserIndex].product.rating < product.rating
          ) {
            // Update the product with the higher rating
            productsWithUsers[existingUserIndex].product = product;
          }
        } else {
          // If the user doesn't exist in productsWithUsers, add the product
          productsWithUsers.push({
            product: product,
            user: product.user,
          });
        }
      }
    });

    // Add the user with priority to the beginning of the productsWithUsers array
    if (userWithPriority) {
      productsWithUsers.unshift(userWithPriority);
    }

    // Calculate the total count of products
    const count = productsWithUsers.length;

    // Send the response with productsWithUsers, userCategories, and pagination information
    res.json({
      product: productsWithUsers,
      page,
      pages: Math.ceil(count / pageSize),
    });
    return;
  } else if (
    req.query.restaurant !== 'restaurant' &&
    req.query.restaurant != null
  ) {
    // Filter products associated with the user
    products = products.filter(
      (product) =>
        product.user._id.toString() === req.query.restaurant.toString()
    );
    // Sort products by rating and product availability (IsFood)
    products.sort((a, b) => {
      // Sort by rating in descending order
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      // Sort by product availability (IsFood) - food products first
      return b.IsFood - a.IsFood;
    });
    const count = products.length;
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
    });
    return;
  }

  // Get the count of IsFood products in the current page
  // const isFoodCount = products.filter((product) => product.IsFood).length;

  // if (isFoodCount < 5) {
  //   // If there are fewer than 4 IsFood items, include all products
  //   const remainingProducts = await Product.find({
  //     ...keyword,
  //     IsFood: false,
  //   })
  //     .sort({ rating: -1 }) // Sort non-food products by rating in descending order
  //     .limit(pageSize - isFoodCount);

  //   products.push(...remainingProducts);
  // }

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

/// @desc    Fetch restaurant product
// @route   GET /api/products/restaurant/:id
// @access  Restaurants
const getRestaurantProduct = asyncHandler(async (req, res) => {
  let restaurantId;
  // Check if an ID is provided in the request parameters
  if (req.query.id) {
    restaurantId = req.query.id;
  } else {
    // If no ID is provided, use the authenticated user's ID
    restaurantId = req.user._id;
  }

  try {
    const products = await Product.find({ user: restaurantId });

    if (products.length > 0) {
      res.json({ products });
    } else {
      res
        .status(404)
        .json({ error: 'Products not found for this restaurant ID' });
    }
  } catch (error) {
    console.error('Error fetching restaurant products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    // NOTE: this will run if a valid ObjectId but no product was found
    // i.e. product may be null
    res.status(404).json({ error: 'Product not found' });
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.params.id,
    image: '/images/sample.jpg',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
    location: {
      address: 'Sample address',
      latitude: 123456,
      longitude: 123456,
    },
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    category,
    restaurantName,
    restaurantArea,
    IsFood,
    productIsAvailable,
    address,
    latitude,
    longitude,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    throw new Error('Product not found');
  }

  // Check if the user is a restaurant
  if (req.user.roles[0] === 'restaurant') {
    // Update only the productIsAvailable field
    product.productIsAvailable = productIsAvailable;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    // Update other fields if user is admin
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.IsFood = IsFood;
    product.category = category;
    product.location.address = address;
    product.location.latitude = latitude;
    product.location.longitude = longitude;
    product.restaurantArea = restaurantArea;
    product.restaurantName = restaurantName;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ error: 'Product not found' });
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400).json({ error: 'Product already reviewed' });
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404).json({ error: 'Product not found' });
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const choosenProducts = [
    '661c34fb8ae90d53e82be3ac',
    '65e1b3fb385cdbbf8af7cfd5',
    '661c34f28ae90d53e82be39a',
  ];

  // Find the three chosen products by their IDs
  const products = await Product.find({ _id: { $in: choosenProducts } });

  res.json(products);
});

// @desc    Update all products to available
// @route   PATCH /api/products
// @access  Admin
const updateAllProductsToAvailable = asyncHandler(async (req, res) => {
  if (req.body.userId) {
    // If userId is provided, update only the products associated with that userId
    await Product.updateMany(
      { user: req.body.userId },
      { productIsAvailable: true }
    );
  } else {
    // Update all products to available
    await Product.updateMany({}, { productIsAvailable: true });
  }

  res.status(200).json({
    message: 'All products updated to available state',
  });
});
// @desc    Update all products to available
// @route   PATCH /api/products/notavailable
// @access  Admin
const updateAllProductsToNotAvailable = asyncHandler(async (req, res) => {
  if (req.body.userId) {
    // If userId is provided, update only the products associated with that userId
    await Product.updateMany(
      { user: req.body.userId },
      { productIsAvailable: false }
    );
  } else {
    // Update all products to not available
    await Product.updateMany({}, { productIsAvailable: false });
  }

  res.status(200).json({
    message: 'All products updated to not available state',
  });
});

export {
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
};

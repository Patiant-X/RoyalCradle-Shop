import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import { calculateUserDistance } from '../utils/calculateDeliveryDistanceFee.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
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

  const count = await Product.countDocuments({ ...keyword });
  let products = await Product.find({ ...keyword })
    .sort({ IsFood: -1, rating: -1, numReviews: -1 }) // Sort in descending order by IsFood, rating, and numReviews
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
      const mergedProducts = [...products, ...uniqueProducts];

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
  }

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch restaurant product
// @route   GET /api/products/restaurant
// @access  Public
const getRestaurantProduct = asyncHandler(async (req, res) => {
  const restaurantId = req.user._id;
  const product = await Product.find({ user: restaurantId });
  res.json({ product });
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
    res.status(404).json({error: 'Product not found'});
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  if (req.user.roles[0] === 'restaurant') {
    const restaurantId = req.user._id;
    const data = await Product.find({ user: restaurantId });
    if (data?.length > 0) {
      res.status(400).json({error: 'Restaurant can only have one product'});
      throw new Error('Restaurant can only have one product');
    }
  }
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
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

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
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

  // const restaurantId = req.user._id;
  // const data = await Product.find({ user: restaurantId });

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.IsFood = IsFood;
    product.category = category;
    product.productIsAvailable = productIsAvailable;
    product.location.address = address;
    product.location.latitude = latitude;
    product.location.longitude = longitude;
    product.restaurantArea = restaurantArea;
    product.restaurantName = restaurantName;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json(req.body);
    throw new Error('Product not found');
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
    res.status(404).json({error: 'Product not found'});
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
      res.status(400).json({error: 'Product already reviewed'});
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
    res.status(404).json({error: 'Product not found'});
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .sort({ rating: -1 })
    .limit(3);

  res.json(products);
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
};

import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/userModel.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Read JWT from the 'jwt' cookie
    token = req.cookies.jwt;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.userId).select('-password');

        next();
      } catch (error) {
        res.status(401).json("not authorized no token");
        throw new Error('Not authorized, token failed');
      }
    } else {
      res.status(401).json("not authorized no token");
      throw new Error('Not authorized, no token');
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User must have token to reset password
const protectResetPassword = asyncHandler(async (req, res, next) => {
  // Read JWT from the 'jwt' body
  const { token } = req.body;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401).json("not authorized no token");
    throw new Error('Not authorized, no token');
  }
});

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.roles[0] === 'admin') {
    next();
  } else {
    res.status(401).json("not authorized no token");
    throw new Error('Not authorized');
  }
};

// User must be an admin / Driver
const adminDriver = (req, res, next) => {
  if (
    req.user &&
    (req.user.roles[0] === 'driver' || req.user.roles[0] === 'admin')
  ) {
    next();
  } else {
    res.status(401).json("not authorized no token");
    throw new Error('Not authorized');
  }
};

// User must be an admin / Restaurant
const adminRestaurant = (req, res, next) => {
  if (
    req.user &&
    (req.user.roles[0] === 'restaurant' || req.user.roles[0] === 'admin')
  ) {
    next();
  } else {
    res.status(401).json("not authorized no token");
    throw new Error('Not authorized');
  }
};

// User must be an admin / Driver / Restaurant
const adminDriverRestaurant = (req, res, next) => {
  if (
    req.user &&
    (req.user.roles[0] === 'restaurant' ||
      req.user.roles[0] === 'driver' ||
      req.user.roles[0] === 'admin')
  ) {
    next();
  } else {
    res.status(401).json("not authorized no token");
    throw new Error('Not authorized');
  }
};

export {
  protect,
  adminDriver,
  adminRestaurant,
  protectResetPassword,
  adminDriverRestaurant,
  admin,
};

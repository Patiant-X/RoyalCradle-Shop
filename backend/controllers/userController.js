import asyncHandler from '../middleware/asyncHandler.js';
import generateToken, {
  generateTokenForgotPassword,
} from '../utils/generateToken.js';
import User from '../models/userModel.js';
import SendEmail from '../utils/SendEmail.js';
import {
  OrderConfirmationContent,
  UserResetPasswordContent,
} from '../utils/emailContents.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.roles[0],
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Forgot Password
// @route   POST /api/users/forgot-password
// @access  Public
const userForgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    await User.findOne({ email }).then((user) => {
      if (!user) {
        res.status(400);
        throw new Error('Invalid Email');
      }
      const token = generateTokenForgotPassword(user._id);
      const emailContent = UserResetPasswordContent(
        user._name,
        user._id,
        token
      );
      const state = false;
      SendEmail(
        res,
        user.email,
        emailContent.message,
        emailContent.subject,
        state
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message || error });
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, mobileNumber } = req.body;

  const userExists = await User.findOne({ email, mobileNumber });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    mobileNumber,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      roles: user.roles,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // this user data comes from using the jwt token
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.roles[0],
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Reset User Password
// @route   GET /api/users/reset-password
// @access  Private
const userResetPassword = asyncHandler(async (req, res) => {
  const { password, id } = req.body;
  const user = await User.findById(id);
  if (user) {
    if (password) {
      user.password = password;
    }

    await user.save();

    res.status(201).json('Password reset successfully');
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobileNumber = req.body.mobileNumber || user.mobileNumber;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobileNumber: updatedUser.mobileNumber,
      role: updatedUser.roles[0],
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.roles[0] == 'admin') {
      res.status(400);
      throw new Error('Can not delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
      user.roles = req.body.roles || user.roles;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        role: updatedUser.roles[0],
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    // Handle different errors
    res.status(500).json({ message: 'Server Error' || error.message });
  }
});

export {
  authUser,
  userForgotPassword,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  userResetPassword,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};

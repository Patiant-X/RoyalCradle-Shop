import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a name'],
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      trim: true,
      unique: true,
      validate: {
        validator: function (v) {
          // Regular expression for email validation
          return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /\d{3}[-\s]?\d{3}[-\s]?\d{4}/.test(v); // Validates South African cellphone number format
        },
        message: (props) =>
          `${props.value} is not a valid South African cellphone number!`,
      },
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minLength: [8, 'Password must be a minimum of 8 characters'],
    },
    roles: {
      type: [
        {
          type: String,
          enum: ['admin', 'driver', 'restaurant', 'customer'],
        },
      ],
      required: true,
      default: ['customer'], // Default role set to customer
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Define pre-save hook to update timestamps with South African time
userSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = moment().tz('Africa/Johannesburg');
  }
  if (!this.updatedAt) {
    this.updatedAt = moment().tz('Africa/Johannesburg');
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;

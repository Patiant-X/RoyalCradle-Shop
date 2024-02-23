import mongoose from 'mongoose';
import moment from 'moment-timezone';

const connectDB = async () => {
  try {
    moment.tz.setDefault('African/Johannesburg')
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

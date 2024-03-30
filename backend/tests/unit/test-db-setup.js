const MongoMemoryServer = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Setup function to initialize the in-memory MongoDB server and connect Mongoose to it.
 */
export const setupTestDB = async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

/**
 * Teardown function to disconnect Mongoose from the in-memory MongoDB server and stop the server.
 */
export const teardownTestDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

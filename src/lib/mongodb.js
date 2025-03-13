import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: Please define the MONGODB_URI environment variable inside a .env.local file");
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB using Mongoose and caches the connection.
 * @returns {Promise<mongoose.Connection>} The Mongoose connection.
 */
async function connectToDatabase() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {};

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("MongoDB connected");
        return mongooseInstance.connection;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export { connectToDatabase };

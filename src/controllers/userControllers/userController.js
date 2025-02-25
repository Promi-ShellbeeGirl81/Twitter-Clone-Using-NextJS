import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import mongoose from "mongoose";

export async function getUser(userId) {
  try {
    // Log mongoose and Types.ObjectId for debugging
    console.log("Mongoose:", mongoose);
    console.log("mongoose.Types.ObjectId:", mongoose.Types.ObjectId);

    // Ensure userId is a string (in case it's passed as an object)
    if (typeof userId === 'object' && userId !== null) {
      userId = userId.toString();  // Convert to string
    }

    // Check if the userId is a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { status: 400, data: { message: "Invalid user ID format." } };
    }

    await connectToDatabase(); // Ensure DB is connected before querying

    // Find the user using Mongoose's model
    const user = await User.findById(userId);

    if (!user) {
      return { status: 404, data: null }; // No user found
    }

    return { status: 200, data: user }; // User found
  } catch (error) {
    console.error("Error fetching user:", error);
    return { status: 500, data: { message: "Failed to fetch user" } };
  }
}

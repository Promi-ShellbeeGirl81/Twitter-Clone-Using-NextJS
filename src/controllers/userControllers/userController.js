import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import mongoose from "mongoose";

export async function getUser(userId) {
  try {
    console.log("Mongoose:", mongoose);
    console.log("mongoose.Types.ObjectId:", mongoose.Types.ObjectId);

    if (typeof userId === 'object' && userId !== null) {
      userId = userId.toString();  
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { status: 400, data: { message: "Invalid user ID format." } };
    }

    await connectToDatabase(); 
    const user = await User.findById(userId);

    if (!user) {
      return { status: 404, data: null }; 
    }

    return { status: 200, data: user }; 
  } catch (error) {
    console.error("Error fetching user:", error);
    return { status: 500, data: { message: "Failed to fetch user" } };
  }
}

export async function updateUser(userId, updateData) {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Database error");
  }
}
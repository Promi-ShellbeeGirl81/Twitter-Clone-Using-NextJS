import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const registerUser = async ({ name, email, dateOfBirth, password }) => {
  try {
    if (!isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      dateOfBirth,
      password: hashedPassword,
      id: new mongoose.Types.ObjectId(),
    });

    await newUser.save();

    return { message: "User created successfully, please log in" };
  } catch (error) {
    throw new Error(error.message);
  }
};

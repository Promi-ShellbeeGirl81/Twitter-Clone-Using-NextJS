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

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    if (!Date.parse(dateOfBirth)) {
      throw new Error("Invalid date of birth format");
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      name,
      email,
      dateOfBirth: new Date(dateOfBirth), 
      password: hashedPassword,
    });

    await newUser.save();

    return { message: "User created successfully, please log in" };
  } catch (error) {
    throw new Error(error.message);
  }
};


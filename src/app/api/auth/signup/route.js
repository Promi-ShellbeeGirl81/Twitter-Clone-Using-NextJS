import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/user";


export async function POST(req) {
  await connectToDatabase();

  const { name, email, dateOfBirth, password} =
    await req.json();
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  if (!isValidEmail) {
    return NextResponse.json({ message: "email is invalid" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password can't be less than 6 characters" },
      { status: 400 }
    );
  }
  try {
    await connectToDatabase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
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
    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

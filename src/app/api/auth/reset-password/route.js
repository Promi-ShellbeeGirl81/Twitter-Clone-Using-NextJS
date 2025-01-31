import connectToDatabase from "@/lib/mongodb"; 
import User from '@/models/user';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
      await connectToDatabase(); 
  
      const { email, password } = await req.json();
  
      if (!email || !password) {
        return NextResponse.json(
          { message: "Email and password are required" },
          { status: 400 }
        );
      }
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
  
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Update user password
      user.password = hashedPassword;
      await user.save();
  
      return NextResponse.json(
        { message: "Password reset successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error resetting password:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  
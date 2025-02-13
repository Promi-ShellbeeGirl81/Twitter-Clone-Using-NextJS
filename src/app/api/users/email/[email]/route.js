import { NextResponse } from "next/server";
import {connectToDatabase} from "@/lib/mongodb"; // Ensure this is your DB connection file
import User from "@/models/user"; // Ensure your User model is correctly imported

export async function GET(req) {
  try {
    await connectToDatabase();

    // Extract email from request URL
    const email = req.nextUrl.pathname.split("/").pop(); 

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

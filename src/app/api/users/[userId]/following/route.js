import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(req, { params }) {
  const { userId } = await params; 
  
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch the user and their following list
    const user = await User.findById(userId).populate("following");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the list of users the user is following
    return NextResponse.json({ following: user.following }, { status: 200 });
  } catch (error) {
    console.error("Error fetching following users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

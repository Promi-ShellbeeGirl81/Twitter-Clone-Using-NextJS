import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(req, { params }) {
  const { userId } = await params; 
  
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const user = await User.findById(userId).populate("followers");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ followers: user.followers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching followers users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

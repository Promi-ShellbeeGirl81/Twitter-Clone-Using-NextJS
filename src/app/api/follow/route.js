import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import { authOptions } from "@/lib/auth/authOptions"; 
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const body = await req.json(); 
    console.log("Request Body:", body); 

    const { userIdToFollow } = body; 
    console.log("Extracted userIdToFollow:", userIdToFollow); 

    const session = await getServerSession(authOptions);
    console.log("Session:", session); 

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userIdToFollow) {
      return NextResponse.json({ error: "User ID to follow is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userToFollow = await User.findById(userIdToFollow);
    if (!userToFollow) {
      return NextResponse.json({ error: "User to follow not found" }, { status: 404 });
    }

    // ✅ Ensure `following` and `followers` are arrays
    user.following = user.following || [];
    userToFollow.followers = userToFollow.followers || [];

    const userIdToFollowObjId = new mongoose.Types.ObjectId(userIdToFollow);

    // ✅ Check if already following
    const isAlreadyFollowing = user.following.some(id => id.toString() === userIdToFollowObjId.toString());
    if (isAlreadyFollowing) {
      return NextResponse.json({ message: "Already following this user" }, { status: 400 });
    }

    // ✅ Add to following/followers lists
    user.following.push(userIdToFollowObjId);
    await user.save();

    userToFollow.followers.push(user._id);
    await userToFollow.save();

    return NextResponse.json({ message: "Followed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

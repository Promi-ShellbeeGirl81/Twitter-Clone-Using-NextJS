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
    const { userIdToUnfollow } = body;

    const session = await getServerSession(authOptions);
    console.log("Session:", session); // ✅ Debug session data

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userIdToUnfollow) {
      return NextResponse.json({ error: "User ID to unfollow is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userToUnfollow = await User.findById(userIdToUnfollow);
    if (!userToUnfollow) {
      return NextResponse.json({ error: "User to unfollow not found" }, { status: 404 });
    }

    // ✅ Ensure following array is defined
    user.following = user.following || [];
    userToUnfollow.followers = userToUnfollow.followers || [];

    const userIdToUnfollowObjId = new mongoose.Types.ObjectId(userIdToUnfollow);
    const isAlreadyFollowing = user.following.some(id => id.toString() === userIdToUnfollowObjId.toString());

    if (!isAlreadyFollowing) {
      return NextResponse.json({ message: "You are not following this user" }, { status: 400 });
    }

    // ✅ Remove userId from following & followers lists
    user.following = user.following.filter(id => id.toString() !== userIdToUnfollowObjId.toString());
    await user.save();

    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== user._id.toString());
    await userToUnfollow.save();

    return NextResponse.json({ message: "Unfollowed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import { getServerSession } from "next-auth";

export async function POST(req) {
  try {
    const { userIdToFollow } = await req.json(); // Get the userIdToFollow from the request body
    const session = await getServerSession(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userIdToFollow) {
      return NextResponse.json({ error: "User ID to follow is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    const userToFollow = await User.findById(userIdToFollow);

    if (!userToFollow) {
      return NextResponse.json({ error: "User to follow not found" }, { status: 404 });
    }

    // Check if user is already following the target user
    const isAlreadyFollowing = user.following.includes(userIdToFollow);

    if (isAlreadyFollowing) {
      // Unfollow: Remove the user from the following and the followed user from followers
      user.following = user.following.filter(id => id.toString() !== userIdToFollow);
      await user.save();

      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== user.id);
      await userToFollow.save();

      return NextResponse.json({ message: "Unfollowed successfully" }, { status: 200 });
    } else {
      // Follow: Add the user to the following and the followed user to followers
      user.following.push(userIdToFollow);
      await user.save();

      userToFollow.followers.push(user.id);
      await userToFollow.save();

      return NextResponse.json({ message: "Followed successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error following/unfollowing user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

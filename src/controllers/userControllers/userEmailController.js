import { connectToDatabase } from "@/lib/mongodb"; 
import User from "@/models/user";

export async function getUserByEmail(email) {
  try {
    await connectToDatabase(); 

    const user = await User.findOne({ email }).lean(); 
    if (!user) {
      return { status: 404, data: { message: "User not found" } };
    }
    return { status: 200, data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { status: 500, data: { message: "Server error", error: error.message } };
  }
}

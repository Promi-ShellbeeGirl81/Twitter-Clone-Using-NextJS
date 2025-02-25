import { NextResponse } from "next/server";
import { getUser } from "@/controllers/userControllers/userController";

export async function GET(req, { params }) {
  // Log the entire `params` to understand its structure
  console.log("Received params:", params);  // Log params to inspect its structure
  
  let userId = params.userId;  // Directly access userId from params

  if (typeof userId !== "string") {
    console.error("userId is not a string, it's:", userId);
    return NextResponse.json({ message: "Invalid user ID format." }, { status: 400 });
  }

  // Log userId before processing
  console.log("Received userId before processing:", userId);
  
  userId = String(userId).trim(); // Ensure it's a string and remove unwanted characters

  // You may remove this trimming step unless it's absolutely necessary
  // if (userId.length > 6) {
  //   userId = userId.slice(3, -3);  // Trim first 3 and last 3 characters (if needed)
  // }

  console.log("Processed userId:", userId);  // Log processed userId

  if (!userId) {
    return NextResponse.json({ message: "User ID is required." }, { status: 400 });
  }

  const { status, data } = await getUser(userId);

  if (!data) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json(data, { status });
}

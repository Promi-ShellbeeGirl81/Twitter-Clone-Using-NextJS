import { NextResponse } from "next/server";
import { getUser } from "@/controllers/userControllers/userController";

export async function GET(req, { params }) {
  console.log("Received params:", params);  
  
  let userId = await params.userId; 

  if (typeof userId !== "string") {
    console.error("userId is not a string, it's:", userId);
    return NextResponse.json({ message: "Invalid user ID format." }, { status: 400 });
  }

  console.log("Received userId before processing:", userId);
  
  userId = String(userId).trim(); 

  if (!userId) {
    return NextResponse.json({ message: "User ID is required." }, { status: 400 });
  }

  const { status, data } = await getUser(userId);

  if (!data) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json(data, { status });
}

import { NextResponse } from "next/server";
import { getUser } from "@/controllers/userControllers/userController";

export async function GET(req, { params }) {
  console.log("Received params:", params);  

  const userId = params?.userId;  
  
  if (!userId || typeof userId !== "string") {
    console.error("Invalid userId:", userId);
    return NextResponse.json({ message: "Invalid or missing user ID." }, { status: 400 });
  }

  console.log("Processing userId:", userId);

  try {
    const { status, data } = await getUser(userId);

    if (!data) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}

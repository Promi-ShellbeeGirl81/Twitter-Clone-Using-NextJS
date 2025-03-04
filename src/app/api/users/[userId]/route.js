import { NextResponse } from "next/server";
import { getUser, updateUser} from "@/controllers/userControllers/userController";

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

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { userId, name, bio, dateOfBirth, location, profilePic, coverPic } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required." },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(userId, {
      name,
      bio,
      dateOfBirth,
      location,
      profilePic,
      coverPic,
    });

    return NextResponse.json(
      { message: "Profile updated successfully!", updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}

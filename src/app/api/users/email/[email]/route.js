import { NextResponse } from "next/server";
import { getUserByEmail } from "@/controllers/userControllers/userEmailController"; 

export async function GET(req) {
  try {
    const email = req.nextUrl.pathname.split("/").pop(); 

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const { status, data } = await getUserByEmail(email);

    return NextResponse.json(data, { status });

  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

import User from "@/models/user";
import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDatabase();
    const users = await User.find();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

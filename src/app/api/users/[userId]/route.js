import { NextResponse } from "next/server";
import { getUser } from "@/controllers/userControllers/userController";

export async function GET(req, { params }) {
  try {
    const { status, data } = await getUser({ params });
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

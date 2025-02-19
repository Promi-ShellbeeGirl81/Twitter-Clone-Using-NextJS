
import { NextResponse } from "next/server";
import { getUsers } from "@/controllers/userControllers/userAllController"; 

export async function GET(req) {
  try {
    const { status, data } = await getUsers(); 
    return NextResponse.json(data, { status }); 
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

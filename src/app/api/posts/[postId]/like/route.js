import { NextResponse } from "next/server";
import { POST as handlePostCreation} from "@/controllers/postControllers/postLikeController";  

export async function POST(req) {
  try {
    return await handlePostCreation(req);  
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

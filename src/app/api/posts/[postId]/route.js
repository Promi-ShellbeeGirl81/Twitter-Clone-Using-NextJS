import { NextResponse } from "next/server";
import { GET  as getPostsById} from "@/controllers/postControllers/postCommentController"; 

export async function GET(req, { params }) {
  try {
    return await getPostsById(req, params); 
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

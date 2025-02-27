import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { handleRepost } from "@/controllers/postControllers/postRepostController";

export const POST = async (req) => {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { postId, isQuote, quoteText, postMedia } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const response = await handleRepost(session, postId, isQuote, quoteText, postMedia);
    
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

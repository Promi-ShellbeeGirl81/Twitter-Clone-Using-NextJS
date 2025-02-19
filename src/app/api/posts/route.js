import { GET as getPosts, POST as createPosts } from "@/controllers/postControllers/postController";

export async function GET(req) {
  try {
    return await getPosts(req); 
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req) {
  try {
    return await createPosts(req); 
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

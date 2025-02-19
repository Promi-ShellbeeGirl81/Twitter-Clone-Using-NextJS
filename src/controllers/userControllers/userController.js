import { connectToDatabase } from "@/lib/mongodb";

export async function getUser({ params }) {
  try {
    const { userId } = params;
    const client = await connectToDatabase();
    const db = client.db();
    const user = await db.collection("users").findOne({ _id: userId });

    if (!user) {
      return { status: 404, data: { message: "User not found" } };
    }

    return { status: 200, data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { status: 500, data: { message: "Failed to fetch user" } };
  }
}

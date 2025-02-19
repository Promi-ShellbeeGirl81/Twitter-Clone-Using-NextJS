import User from "@/models/user"; 

export async function getUsers() {
  try {
    const users = await User.find(); 
    return { status: 200, data: users }; 
  } catch (error) {
    console.error("Error fetching users:", error);
    return { status: 500, data: { message: "Server error", error: error.message } };
  }
}

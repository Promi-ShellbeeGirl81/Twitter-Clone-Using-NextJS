import User from "@/models/user";
import bcrypt from "bcryptjs";
import {connectToDatabase} from "@/lib/mongodb";

export const resetPassword = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  await connectToDatabase();
  const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    return { message: "Password reset successfully"};

};

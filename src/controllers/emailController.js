import { sendVerificationEmail } from "@/lib/verifyemail";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import crypto from "crypto";

export const verifyUser = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }
  await connectToDatabase();

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new Error("User with this email doesn't exist");
  }
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiration = Date.now() + 3600000;

  await usersCollection.insertOne({
    email,
    verificationToken,
    verificationTokenExpiration,
    isVerified: false,
  });
  await sendVerificationEmail(email, verificationToken);
  return {message: "Verification email sent successfully"};
};

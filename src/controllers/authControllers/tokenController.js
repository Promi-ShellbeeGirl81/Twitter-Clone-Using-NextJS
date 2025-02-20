import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import crypto from "crypto";
import { sendResetPasswordEmail } from "@/lib/resetpassword";

export const requestPasswordReset = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User with this email doesn't exist");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiration = Date.now() + 3600000;

  user.verificationToken = verificationToken;
  user.verificationTokenExpiration = verificationTokenExpiration;
  user.isVerified = false;

  await user.save();

  await sendResetPasswordEmail(email, verificationToken);

  return { message: "Verification email sent successfully" };
};

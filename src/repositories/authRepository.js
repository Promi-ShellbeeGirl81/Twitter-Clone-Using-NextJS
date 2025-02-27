import { connectToDatabase } from "../lib/mongodb";
import User from "../models/user";
import bcrypt from "bcryptjs";

export const getUserFromOAuth = async (account, profile) => {
  await connectToDatabase();

  let existingUser = await User.findOne({ email: profile.email });

  if (!existingUser) {
    existingUser = await User.create({
      id: profile.sub || profile.id,
      email: profile.email,
      name: profile.name || profile.login || "User",
      image: profile.picture || profile.image,
      provider: account.provider,
    });
    console.log("New user created:", existingUser);
  } else {
    console.log("Existing user found:", existingUser);
  }

  return existingUser;
};

export const getUserByCredentials = async (credentials) => {
  await connectToDatabase();

  const user = await User.findOne({
    $or: [{ email: credentials.identifier }, { name: credentials.identifier }],
  });

  if (!user) {
    console.log("No user found with this identifier.");
    return null;
  }

  const isValidPassword = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isValidPassword) {
    console.log("Invalid Password");
    return null;
  }

  return user;
};

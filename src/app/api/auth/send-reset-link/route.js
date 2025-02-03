import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb"; 
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    if (!db) throw new Error("Database connection failed");

    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });

    if (!existingUser) {
      return NextResponse.json({ message: "User with this email doesn't exist" }, { status: 409 });
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiration = Date.now() + 3600000;

    await usersCollection.updateOne(
      { email },
      { $set: { verificationToken, verificationTokenExpiration, isVerified: false } }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const verificationLink = `${process.env.NEXTAUTH_URL}/resetPassword?token=${verificationToken}/&email=${email}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `Click the link below to reset your password:\n\n${verificationLink}`,
    });

    return NextResponse.json({ message: "Verification email sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json({ message: "Failed to send verification email", error: error.message }, { status: 500 });
  }
}

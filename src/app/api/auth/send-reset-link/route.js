import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb"; 
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Connect to the database
    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Check if the user already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 }); // Conflict status
    }

    // Generate a verification token and expiration time
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiration = Date.now() + 3600000; // 1 hour expiration

    // Store the verification token and expiration time in the database (not yet confirmed)
    await usersCollection.insertOne({
      email,
      verificationToken,
      verificationTokenExpiration,
      isVerified: false, // Mark the user as unverified
    });

    // Set up the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Generate the verification link
    const verificationLink = `${process.env.NEXTAUTH_URL}/verifyAccount?token=${verificationToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Verification Code",
      text: `Click the link below to verify your account:\n\n${verificationLink}`,
    };

    // Send the verification email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Verification email sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json({ message: "Failed to send verification email", error: error.message }, { status: 500 });
  }
}

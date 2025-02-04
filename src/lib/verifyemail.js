import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const verificationLink = `${process.env.NEXTAUTH_URL}/resetPassword?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Verification Code",
      text: `Click the link below to verify your account:\n\n${verificationLink}`,
    };

    await transporter.sendMail(mailOptions);
};

import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const verificationLink = `${process.env.NEXTAUTH_URL}/resetPassword?token=${token}&email=${email}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password",
    text: `Click the link below to reset your password:\n\n${verificationLink}`,
  });

  console.log(`Reset password email sent to: ${email}`);
};

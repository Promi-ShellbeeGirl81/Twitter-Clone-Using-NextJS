import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import * as authController from "../../controllers/authControllers/authController";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: authController.authorize,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      return await authController.signIn({ account, profile });
    },
    async jwt({ token, user }) {
      return await authController.jwt({ token, user });
    },
    async session({ session, token }) {
      return await authController.session({ session, token });
    },
  },
  pages: {
    signIn: "/home",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

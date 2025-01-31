import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
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
      async authorize(credentials) {
        try {
          await connectToDatabase();
          //console.log("cre" + credentials);
          const user = await User.findOne({
            $or: [
              { email: credentials.identifier },
              { name: credentials.identifier },
            ],
          });
          console.log("user" + user);
          if (!user) {
            console.log("No user found with this identifier.");
            return null;
          }
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );
          console.log(
            "Stored password hash:",
            user.password,
            credentials.password
          );

          if (!isValidPassword) {
            console.log("Pass no match");
            return null;
          }
          return user;
        } catch (error) {
          console.log(error);
          {
            return null;
          }
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "github") {
        console.log("Github login: ${profile.email}, ${profile.name}");
        await connectToDatabase();
        const existingUser = User.findOne({ email: profile.email });
        if (!existingUser) {
          await User.create({
            id: profile.id,
            email: profile.email,
            name: profile.name || profile.login,
            image: profile.image,
          });
        }
      }
      if (account?.provider === "google") {
        console.log(`Google login: ${profile.email}, ${profile.name}`);
        const existingUser = await User.findOne({ email: profile.email });
        if (!existingUser) {
          await User.create({
            id: profile.sub, 
            email: profile.email,
            name: profile.name || "Google User",
            image: profile.picture,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        (token.id = user._id), (token.email = user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          email: token.email,
          name: token.name,
          image: token.picture,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
export { handler as GET, handler as POST };

import { handleOAuthLogin, authorizeUser } from "../../services/authService";

// Handle OAuth login (GitHub/Google)
export const signIn = async ({ account, profile }) => {
  if (account.provider === "github" || account.provider === "google") {
    const user = await handleOAuthLogin(account, profile);
    if (user) {
      return true;
    } else {
      return false;
    }
  }
  return true;
};

// JWT callback logic to store user data
export const jwt = async ({ token, user }) => {
  if (user) {
    token.id = user._id;
    token.email = user.email;
    token.name = user.name;
    token.image = user.image;
  }
  return token;
};

// Session callback logic to persist user data
export const session = async ({ session, token }) => {
  if (token) {
    session.user = {
      email: token.email,
      name: token.name,
      image: token.image,
    };
  }
  return session;
};

// Handle credential-based user authorization
export const authorize = async (credentials) => {
  return await authorizeUser(credentials);
};

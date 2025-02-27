import { handleOAuthLogin, authorizeUser } from "../../services/authService";

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

export const jwt = async ({ token, user }) => {
  if (user) {
    token.id = user._id;
    token.email = user.email;
    token.name = user.name;
    token.image = user.image;
  }
  return token;
};

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

export const authorize = async (credentials) => {
  return await authorizeUser(credentials);
};

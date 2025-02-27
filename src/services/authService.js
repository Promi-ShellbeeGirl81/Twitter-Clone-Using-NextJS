import { getUserFromOAuth } from "../repositories/authRepository"; 

export const handleOAuthLogin = async (account, profile) => {
  const user = await getUserFromOAuth(account, profile);
  return user;
};

export const authorizeUser = async (credentials) => {
  return await getUserByCredentials(credentials);  
};

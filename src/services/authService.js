import { getUserFromOAuth } from "../repositories/authRepository"; 

// Handle OAuth login logic
export const handleOAuthLogin = async (account, profile) => {
  const user = await getUserFromOAuth(account, profile);
  return user;
};

// Handle user credentials validation
export const authorizeUser = async (credentials) => {
  // Authorization logic here
  return await getUserByCredentials(credentials);  
};

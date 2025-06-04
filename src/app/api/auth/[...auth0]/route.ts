import { handleAuth, handleProfile } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  profile: handleProfile(),
  login: async (req) => {
    return handleAuth().login(req);
  },
  callback: async (req) => {
    return handleAuth().callback(req);
  },
  logout: async (req) => {
    return handleAuth().logout(req);
  },
});

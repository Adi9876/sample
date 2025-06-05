import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_ISSUER_BASE_URL?.replace("https://", "") || "",
  clientId: process.env.AUTH0_CLIENT_ID || "",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
  appBaseUrl: process.env.AUTH0_BASE_URL || "http://localhost:3000",
  secret: process.env.AUTH0_SECRET || "",
  routes: {
    callback: "/api/auth/callback",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
  },
  session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours in seconds
    rolling: true,
  },
});

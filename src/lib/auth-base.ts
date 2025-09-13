import type { NextAuthConfig } from "next-auth";

export const authBaseConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      // Persist the user ID to the token right after signin
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      // Public paths that don't require authentication
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/robots.txt") ||
        pathname.startsWith("/sitemap.xml") ||
        pathname.startsWith("/static") ||
        pathname.startsWith("/images")
      ) {
        return true;
      }

      // If user is not authenticated, redirect to login
      if (!auth?.user) {
        return false;
      }

      return true;
    },
  },
};

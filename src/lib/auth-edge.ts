import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Edge-safe config with NO Prisma imports
export const { auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async () => {
        // This is just for edge compatibility - actual auth logic is in server config
        return null;
      },
    }),
  ],
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
});

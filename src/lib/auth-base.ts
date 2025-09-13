import type { NextAuthConfig } from "next-auth";

export const authBaseConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      // Public paths
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/robots.txt") ||
        pathname.startsWith("/sitemap.xml") ||
        pathname.startsWith("/static") ||
        pathname.startsWith("/images")
      ) {
        return true;
      }

      // Everything else requires session
      return !!auth?.user;
    },
  },
};

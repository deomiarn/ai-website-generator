import NextAuth from "next-auth";

// Edge-safe config with NO Prisma imports
export const { auth } = NextAuth({
  providers: [],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
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
});

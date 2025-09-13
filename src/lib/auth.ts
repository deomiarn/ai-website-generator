import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authBaseConfig } from "./auth-base";

const serverAuthConfig: NextAuthConfig = {
  ...authBaseConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email?.toString().trim();
        const password = credentials?.password?.toString() ?? "";
        if (!email || !password) return null;

        const { PrismaClient } = await import("@/generated/prisma");
        const prisma = new PrismaClient();
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const bcrypt = await import("bcrypt");
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          };
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
};

export const { handlers, auth, signIn, signOut } = NextAuth(serverAuthConfig);

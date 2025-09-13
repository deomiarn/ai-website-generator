import { PrismaClient, Role } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const seedEmail = process.env.AUTH_SEED_EMAIL;
  const seedPassword = process.env.AUTH_SEED_PASSWORD;
  const seedRole = (process.env.AUTH_SEED_ROLE as Role) || "USER";

  if (!seedEmail || !seedPassword) {
    console.log("⚠️  AUTH_SEED_EMAIL and AUTH_SEED_PASSWORD are required in .env");
    return;
  }

  const passwordHash = await bcrypt.hash(seedPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: seedEmail },
    update: {
      passwordHash,
      role: seedRole,
    },
    create: {
      email: seedEmail,
      name: seedEmail.split("@")[0],
      passwordHash,
      role: seedRole,
    },
  });

  console.log("✅ Seeded user:", { id: user.id, email: user.email, role: user.role });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

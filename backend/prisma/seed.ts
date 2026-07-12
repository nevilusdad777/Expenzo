/**
 * Global seed script.
 * Default categories and accounts are now seeded per-user on registration
 * via src/services/userSeed.service.ts.
 * This script is intentionally a no-op.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seed: default categories and accounts are created per user on registration.');
  console.log('Seed complete — nothing to do here.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

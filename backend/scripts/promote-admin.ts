import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!firstUser) {
    console.log('No users found in database.');
    return;
  }
  await prisma.user.update({ where: { id: firstUser.id }, data: { role: 'ADMIN' } });
  console.log(`Promoted "${firstUser.name}" (${firstUser.email}) to ADMIN`);

  const allUsers = await prisma.user.findMany({ select: { name: true, email: true, role: true } });
  console.log('\nAll users:', allUsers);
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const family = await prisma.family.create({
    data: {
      name: 'Phase 5 Validation Family',
      description: 'Validation family for family-member CRUD checks',
      status: 'ACTIVE',
    },
  });

  const payload = {
    familyId: family.id,
    firstName: 'Test',
    lastName: 'User',
    status: 'LIVING',
  };

  const response = await fetch('http://localhost:5000/api/family-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  console.log(`HTTP_STATUS=${response.status}`);
  console.log(text);

  await prisma.familyMember.deleteMany({ where: { familyId: family.id } });
  await prisma.family.delete({ where: { id: family.id } });
} finally {
  await prisma.$disconnect();
}

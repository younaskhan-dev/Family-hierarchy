import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const family = await prisma.family.create({
    data: {
      name: 'Phase 11 Validation Family',
      description: 'Validation family for import/export checks',
      status: 'ACTIVE',
    },
  });

  const memberOne = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Alpha',
      lastName: 'One',
      status: 'LIVING',
    },
  });

  const memberTwo = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Beta',
      lastName: 'Two',
      status: 'LIVING',
    },
  });

  await prisma.parentChildRelationship.create({
    data: {
      familyId: family.id,
      parentId: memberOne.id,
      childId: memberTwo.id,
      relationshipType: 'BIOLOGICAL',
    },
  });

  console.log('Phase 11 validation setup complete.');
} finally {
  const family = await prisma.family.findFirst({ where: { name: 'Phase 11 Validation Family' } });
  if (family) {
    await prisma.importantDate.deleteMany({ where: { familyId: family.id } });
    await prisma.event.deleteMany({ where: { familyId: family.id } });
    await prisma.photo.deleteMany({ where: { familyId: family.id } });
    await prisma.document.deleteMany({ where: { familyId: family.id } });
    await prisma.marriage.deleteMany({ where: { familyId: family.id } });
    await prisma.parentChildRelationship.deleteMany({ where: { familyId: family.id } });
    await prisma.familyMember.deleteMany({ where: { familyId: family.id } });
    await prisma.family.delete({ where: { id: family.id } });
  }
  await prisma.$disconnect();
}

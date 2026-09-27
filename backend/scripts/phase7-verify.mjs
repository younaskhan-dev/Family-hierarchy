import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const family = await prisma.family.create({
    data: {
      name: 'Phase 7 Validation Family',
      description: 'Validation family for tree checks',
      status: 'ACTIVE',
    },
  });

  const parent = await prisma.familyMember.create({
    data: { familyId: family.id, firstName: 'Root', lastName: 'Parent', status: 'LIVING' },
  });

  const child = await prisma.familyMember.create({
    data: { familyId: family.id, firstName: 'Child', lastName: 'Person', status: 'LIVING' },
  });

  await prisma.parentChildRelationship.create({
    data: {
      familyId: family.id,
      parentId: parent.id,
      childId: child.id,
      relationshipType: 'BIOLOGICAL',
    },
  });

  const response = await fetch(`http://localhost:5000/api/family-tree/${parent.id}`);
  console.log(`TREE_STATUS=${response.status}`);
  console.log(await response.text());

  await prisma.parentChildRelationship.deleteMany({ where: { familyId: family.id } });
  await prisma.familyMember.deleteMany({ where: { familyId: family.id } });
  await prisma.family.delete({ where: { id: family.id } });
} finally {
  await prisma.$disconnect();
}

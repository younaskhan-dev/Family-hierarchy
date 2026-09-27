import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const family = await prisma.family.create({
    data: {
      name: 'Phase 6 Validation Family',
      description: 'Validation family for relationship checks',
      status: 'ACTIVE',
    },
  });

  const parent = await prisma.familyMember.create({
    data: { familyId: family.id, firstName: 'Parent', lastName: 'One', status: 'LIVING' },
  });

  const child = await prisma.familyMember.create({
    data: { familyId: family.id, firstName: 'Child', lastName: 'One', status: 'LIVING' },
  });

  const parentChildResponse = await fetch('http://localhost:5000/api/relationships/parent-child', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: family.id,
      parentId: parent.id,
      childId: child.id,
      relationshipType: 'BIOLOGICAL',
    }),
  });

  console.log(`PARENT_CHILD_STATUS=${parentChildResponse.status}`);
  console.log(await parentChildResponse.text());

  const spouseA = await prisma.familyMember.create({
    data: { familyId: family.id, firstName: 'Spouse', lastName: 'One', status: 'LIVING' },
  });

  const spouseB = await prisma.familyMember.create({
    data: { familyId: family.id, firstName: 'Spouse', lastName: 'Two', status: 'LIVING' },
  });

  const marriageResponse = await fetch('http://localhost:5000/api/relationships/marriages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: family.id,
      person1Id: spouseA.id,
      person2Id: spouseB.id,
      status: 'ACTIVE',
    }),
  });

  console.log(`MARRIAGE_STATUS=${marriageResponse.status}`);
  console.log(await marriageResponse.text());
} finally {
  await prisma.$disconnect();
}

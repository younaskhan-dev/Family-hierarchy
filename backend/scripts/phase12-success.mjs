import prisma from '../src/lib/prisma.ts';

const family = await prisma.family.create({
  data: {
    name: 'Phase12 Success Family',
    description: 'Success family for audit validation',
    status: 'ACTIVE',
  },
});

const user = await prisma.user.create({
  data: {
    email: 'phase12.success@example.com',
    passwordHash: 'hash',
    fullName: 'Phase12 Success User',
    status: 'ACTIVE',
  },
});

await prisma.userFamilyAccess.create({
  data: {
    userId: user.id,
    familyId: family.id,
  },
});

const postRes = await fetch('http://localhost:5000/api/audit?familyId=' + family.id, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': user.id,
  },
  body: JSON.stringify({
    userId: user.id,
    action: 'CREATE_MEMBER',
    entityType: 'FamilyMember',
    entityId: 'member-456',
    familyId: family.id,
    metadata: { source: 'phase12-success' },
  }),
});

const getRes = await fetch('http://localhost:5000/api/audit?familyId=' + family.id, {
  headers: {
    'x-user-id': user.id,
  },
});

console.log('CREATE=' + postRes.status);
console.log(await postRes.text());
console.log('LIST=' + getRes.status);
console.log(await getRes.text());

await prisma.auditLog.deleteMany({ where: { familyId: family.id } });
await prisma.userFamilyAccess.deleteMany({ where: { familyId: family.id } });
await prisma.user.deleteMany({ where: { email: 'phase12.success@example.com' } });
await prisma.family.delete({ where: { id: family.id } });
await prisma.$disconnect();

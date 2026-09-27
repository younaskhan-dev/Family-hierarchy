import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const family = await prisma.family.create({
    data: {
      name: 'Phase 12 Validation Family',
      description: 'Validation family for audit log checks',
      status: 'ACTIVE',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'phase12.audit@example.com',
      passwordHash: 'phase12-verify-hash',
      fullName: 'Phase 12 Audit User',
      status: 'ACTIVE',
    },
  });

  await prisma.userFamilyAccess.create({
    data: {
      userId: user.id,
      familyId: family.id,
      roleId: null,
    },
  });

  const accessLogResponse = await fetch('http://localhost:5000/api/audit?familyId=' + family.id, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': user.id,
    },
    body: JSON.stringify({
      userId: user.id,
      action: 'CREATE_MEMBER',
      entityType: 'FamilyMember',
      entityId: 'member-123',
      familyId: family.id,
      metadata: { source: 'phase12-verify' },
    }),
  });

  const listResponse = await fetch(`http://localhost:5000/api/audit?familyId=${family.id}`, {
    headers: { 'x-user-id': user.id },
  });

  console.log(`AUDIT_CREATE_STATUS=${accessLogResponse.status}`);
  console.log(await accessLogResponse.text());
  console.log(`AUDIT_LIST_STATUS=${listResponse.status}`);
  console.log(await listResponse.text());
} finally {
  const family = await prisma.family.findFirst({ where: { name: 'Phase 12 Validation Family' } });
  if (family) {
    await prisma.auditLog.deleteMany({ where: { familyId: family.id } });
    await prisma.userFamilyAccess.deleteMany({ where: { familyId: family.id } });
    await prisma.user.deleteMany({ where: { email: 'phase12.audit@example.com' } });
    await prisma.family.delete({ where: { id: family.id } });
  }
  await prisma.$disconnect();
}

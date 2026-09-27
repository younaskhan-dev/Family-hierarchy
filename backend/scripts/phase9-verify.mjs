import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const family = await prisma.family.create({
    data: {
      name: 'Phase 9 Validation Family',
      description: 'Validation family for event and important date checks',
      status: 'ACTIVE',
    },
  });

  const member = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Phase',
      lastName: 'Nine',
      status: 'LIVING',
    },
  });

  const importantDateResponse = await fetch('http://localhost:5000/api/important-dates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: family.id,
      memberId: member.id,
      title: 'Birthday',
      date: '1990-06-15',
      datePrecision: 'EXACT',
      type: 'BIRTHDAY',
      notes: 'Member birthday',
    }),
  });

  const eventResponse = await fetch('http://localhost:5000/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: family.id,
      title: 'Family Reunion',
      type: 'REUNION',
      eventDate: '2026-09-23T18:00:00.000Z',
      location: 'Grand Hall',
      description: 'Annual reunion',
      createdBy: member.id,
    }),
  });

  console.log(`IMPORTANT_DATE_STATUS=${importantDateResponse.status}`);
  console.log(await importantDateResponse.text());
  console.log(`EVENT_STATUS=${eventResponse.status}`);
  console.log(await eventResponse.text());
} finally {
  const family = await prisma.family.findFirst({ where: { name: 'Phase 9 Validation Family' } });
  if (family) {
    await prisma.importantDate.deleteMany({ where: { familyId: family.id } });
    await prisma.event.deleteMany({ where: { familyId: family.id } });
    await prisma.familyMember.deleteMany({ where: { familyId: family.id } });
    await prisma.family.delete({ where: { id: family.id } });
  }
  await prisma.$disconnect();
}

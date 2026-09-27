import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const family = await prisma.family.create({
    data: {
      name: 'Phase 10 Validation Family',
      description: 'Validation family for search and dashboard checks',
      status: 'ACTIVE',
    },
  });

  const member = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Search',
      lastName: 'User',
      status: 'LIVING',
    },
  });

  await prisma.importantDate.create({
    data: {
      familyId: family.id,
      memberId: member.id,
      title: 'Birthday',
      date: new Date('1990-06-15'),
      datePrecision: 'EXACT',
      type: 'BIRTHDAY',
      notes: 'Search validation',
    },
  });

  await prisma.event.create({
    data: {
      familyId: family.id,
      title: 'Family Gathering',
      type: 'GATHERING',
      eventDate: new Date('2026-11-01T18:00:00.000Z'),
      location: 'Town Hall',
      description: 'Search validation event',
    },
  });

  const searchResponse = await fetch(`http://localhost:5000/api/search?familyId=${family.id}&q=Search`);
  const dashboardResponse = await fetch(`http://localhost:5000/api/dashboard?familyId=${family.id}`);
  const reportsResponse = await fetch(`http://localhost:5000/api/reports/family-summary?familyId=${family.id}`);

  console.log(`SEARCH_STATUS=${searchResponse.status}`);
  console.log(await searchResponse.text());
  console.log(`DASHBOARD_STATUS=${dashboardResponse.status}`);
  console.log(await dashboardResponse.text());
  console.log(`REPORTS_STATUS=${reportsResponse.status}`);
  console.log(await reportsResponse.text());
} finally {
  const family = await prisma.family.findFirst({ where: { name: 'Phase 10 Validation Family' } });
  if (family) {
    await prisma.importantDate.deleteMany({ where: { familyId: family.id } });
    await prisma.event.deleteMany({ where: { familyId: family.id } });
    await prisma.familyMember.deleteMany({ where: { familyId: family.id } });
    await prisma.family.delete({ where: { id: family.id } });
  }
  await prisma.$disconnect();
}

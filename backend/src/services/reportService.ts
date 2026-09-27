import prisma from '../lib/prisma.js';

export const getFamilySummaryReport = async (familyId: string) => {
  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) {
    throw new Error('FAMILY_NOT_FOUND');
  }

  const [
    totalMembers,
    livingMembers,
    deceasedMembers,
    totalEvents,
    totalImportantDates,
    totalMarriages,
    totalParentChildRelationships,
    recentEvents,
    upcomingImportantDates,
  ] = await Promise.all([
    prisma.familyMember.count({ where: { familyId } }),
    prisma.familyMember.count({ where: { familyId, status: 'LIVING' } }),
    prisma.familyMember.count({ where: { familyId, status: 'DECEASED' } }),
    prisma.event.count({ where: { familyId } }),
    prisma.importantDate.count({ where: { familyId } }),
    prisma.marriage.count({ where: { familyId } }),
    prisma.parentChildRelationship.count({ where: { familyId } }),
    prisma.event.findMany({
      where: { familyId },
      orderBy: { eventDate: 'desc' },
      take: 5,
    }),
    prisma.importantDate.findMany({
      where: { familyId, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 5,
    }),
  ]);

  return {
    familyId,
    familyName: family.name,
    generatedAt: new Date().toISOString(),
    totals: {
      totalMembers,
      livingMembers,
      deceasedMembers,
      totalEvents,
      totalImportantDates,
      totalMarriages,
      totalParentChildRelationships,
    },
    recentEvents,
    upcomingImportantDates,
  };
};

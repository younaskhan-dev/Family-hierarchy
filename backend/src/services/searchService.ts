import prisma from '../lib/prisma.js';

export const searchFamilyData = async (familyId: string, query?: string) => {
  const term = query?.trim();

  const familyExists = await prisma.family.findUnique({ where: { id: familyId } });
  if (!familyExists) {
    throw new Error('FAMILY_NOT_FOUND');
  }

  const memberWhere = term
    ? {
        familyId,
        OR: [
          { fullName: { contains: term } },
        ],
      }
    : { familyId };

  const eventWhere = term
    ? {
        familyId,
        OR: [
          { title: { contains: term } },
          { location: { contains: term } },
          { description: { contains: term } },
        ],
      }
    : { familyId };

  const importantDateWhere = term
    ? {
        familyId,
        OR: [
          { title: { contains: term } },
          { notes: { contains: term } },
        ],
      }
    : { familyId };

  const [members, events, importantDates] = await Promise.all([
    prisma.familyMember.findMany({
      where: memberWhere,
      take: 10,
      orderBy: [{ fullName: 'asc' }],
    }),
    prisma.event.findMany({
      where: eventWhere,
      take: 10,
      orderBy: { eventDate: 'asc' },
    }),
    prisma.importantDate.findMany({
      where: importantDateWhere,
      take: 10,
      orderBy: { date: 'asc' },
    }),
  ]);

  return {
    familyId,
    query: term ?? null,
    totalCount: members.length + events.length + importantDates.length,
    members,
    events,
    importantDates,
  };
};

import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

const normalizeNullableDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const listImportantDates = async (familyId?: string) => {
  return prisma.importantDate.findMany({
    where: familyId ? { familyId } : undefined,
    orderBy: { date: 'asc' },
  });
};

export const createImportantDateMetadata = async (input: Record<string, unknown>) => {
  const familyId = String(input.familyId);
  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) throw new Error('FAMILY_NOT_FOUND');

  if (input.memberId) {
    const member = await prisma.familyMember.findFirst({ where: { id: String(input.memberId), familyId } });
    if (!member) throw new Error('MEMBER_NOT_FOUND');
  }

  const importantDateData: Prisma.ImportantDateCreateInput = {
    family: { connect: { id: familyId } },
    member: input.memberId ? { connect: { id: String(input.memberId) } } : undefined,
    title: String(input.title),
    date: normalizeNullableDate(typeof input.date === 'string' ? input.date : null),
    datePrecision: (input.datePrecision as 'EXACT' | 'APPROXIMATE' | 'YEAR_ONLY' | 'UNKNOWN') ?? 'UNKNOWN',
    type: (input.type as 'BIRTHDAY' | 'WEDDING_ANNIVERSARY' | 'DEATH_ANNIVERSARY' | 'CUSTOM') ?? 'CUSTOM',
    notes: typeof input.notes === 'string' ? input.notes : null,
  };

  return prisma.importantDate.create({ data: importantDateData });
};

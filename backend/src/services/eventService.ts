import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

const normalizeNullableDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const listEvents = async (familyId?: string) => {
  return prisma.event.findMany({
    where: familyId ? { familyId } : undefined,
    orderBy: { eventDate: 'asc' },
  });
};

export const createEventRecord = async (input: Record<string, unknown>) => {
  const familyId = String(input.familyId);
  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) throw new Error('FAMILY_NOT_FOUND');

  const eventData: Prisma.EventCreateInput = {
    family: { connect: { id: familyId } },
    title: String(input.title),
    type: (input.type as 'WEDDING' | 'REUNION' | 'GATHERING' | 'MEMORIAL' | 'MEETING' | 'HISTORICAL_EVENT' | 'CUSTOM') ?? 'CUSTOM',
    eventDate: normalizeNullableDate(typeof input.eventDate === 'string' ? input.eventDate : null),
    location: typeof input.location === 'string' ? input.location : null,
    description: typeof input.description === 'string' ? input.description : null,
    createdBy: typeof input.createdBy === 'string' ? input.createdBy : null,
  };

  return prisma.event.create({ data: eventData });
};

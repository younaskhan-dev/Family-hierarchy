import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

const normalizeNullableDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const createParentChildRelationship = async (input: Record<string, unknown>) => {
  const familyId = String(input.familyId);
  const parentId = String(input.parentId);
  const childId = String(input.childId);

  if (parentId === childId) {
    throw new Error('SELF_RELATION_NOT_ALLOWED');
  }

  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) throw new Error('FAMILY_NOT_FOUND');

  const parent = await prisma.familyMember.findUnique({ where: { id: parentId } });
  const child = await prisma.familyMember.findUnique({ where: { id: childId } });
  if (!parent || !child) throw new Error('MEMBER_NOT_FOUND');
  if (parent.familyId !== familyId || child.familyId !== familyId) throw new Error('CROSS_FAMILY_RELATION_NOT_ALLOWED');

  const existing = await prisma.parentChildRelationship.findFirst({
    where: {
      familyId,
      parentId,
      childId,
      relationshipType: (input.relationshipType as Prisma.EnumRelationshipTypeFilter['equals']) ?? 'BIOLOGICAL',
    },
  });

  if (existing) {
    throw new Error('DUPLICATE_RELATIONSHIP');
  }

  return prisma.parentChildRelationship.create({
    data: {
      family: { connect: { id: familyId } },
      parent: { connect: { id: parentId } },
      child: { connect: { id: childId } },
      relationshipType: (input.relationshipType as 'BIOLOGICAL' | 'ADOPTIVE' | 'STEP' | 'UNKNOWN') ?? 'BIOLOGICAL',
      notes: typeof input.notes === 'string' ? input.notes : null,
      createdBy: typeof input.createdBy === 'string' ? input.createdBy : null,
    },
  });
};

export const listParentChildRelationships = async (familyId: string) => {
  return prisma.parentChildRelationship.findMany({
    where: { familyId },
    include: {
      parent: { select: { id: true, fullName: true } },
      child: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const createMarriage = async (input: Record<string, unknown>) => {
  const familyId = String(input.familyId);
  const person1Id = String(input.person1Id);
  const person2Id = String(input.person2Id);

  if (person1Id === person2Id) {
    throw new Error('SELF_MARRIAGE_NOT_ALLOWED');
  }

  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) throw new Error('FAMILY_NOT_FOUND');

  const person1 = await prisma.familyMember.findUnique({ where: { id: person1Id } });
  const person2 = await prisma.familyMember.findUnique({ where: { id: person2Id } });
  if (!person1 || !person2) throw new Error('MEMBER_NOT_FOUND');
  if (person1.familyId !== familyId || person2.familyId !== familyId) throw new Error('CROSS_FAMILY_RELATION_NOT_ALLOWED');

  const marriageData: Prisma.MarriageCreateInput = {
    family: { connect: { id: familyId } },
    person1: { connect: { id: person1Id } },
    person2: { connect: { id: person2Id } },
    marriageDate: normalizeNullableDate(typeof input.marriageDate === 'string' ? input.marriageDate : null),
    marriageDatePrecision: (input.marriageDatePrecision as 'EXACT' | 'APPROXIMATE' | 'YEAR_ONLY' | 'UNKNOWN') ?? 'UNKNOWN',
    marriagePlace: typeof input.marriagePlace === 'string' ? input.marriagePlace : null,
    endDate: normalizeNullableDate(typeof input.endDate === 'string' ? input.endDate : null),
    endDatePrecision: (input.endDatePrecision as 'EXACT' | 'APPROXIMATE' | 'YEAR_ONLY' | 'UNKNOWN') ?? 'UNKNOWN',
    status: (input.status as 'ACTIVE' | 'ENDED' | 'DIVORCED' | 'WIDOWED' | 'UNKNOWN') ?? 'ACTIVE',
    notes: typeof input.notes === 'string' ? input.notes : null,
    createdBy: typeof input.createdBy === 'string' ? input.createdBy : null,
    updatedBy: typeof input.updatedBy === 'string' ? input.updatedBy : null,
  };

  return prisma.marriage.create({ data: marriageData });
};

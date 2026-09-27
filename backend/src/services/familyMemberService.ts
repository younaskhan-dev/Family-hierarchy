import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

const normalizeNullableDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildMemberData = (input: Record<string, unknown>) => {
  const memberData: Prisma.FamilyMemberCreateInput = {
    family: { connect: { id: String(input.familyId) } },
    fullName: input.fullName ? String(input.fullName) : null,
    gender: input.gender ? String(input.gender) : 'Male',
    dateOfBirth: normalizeNullableDate(typeof input.dateOfBirth === 'string' ? input.dateOfBirth : null),
    birthDatePrecision: (input.birthDatePrecision as Prisma.EnumDatePrecisionFilter['equals']) ?? 'UNKNOWN',
    birthPlace: input.birthPlace ? String(input.birthPlace) : null,
    dateOfDeath: normalizeNullableDate(typeof input.dateOfDeath === 'string' ? input.dateOfDeath : null),
    deathDatePrecision: (input.deathDatePrecision as Prisma.EnumDatePrecisionFilter['equals']) ?? 'UNKNOWN',
    deathPlace: input.deathPlace ? String(input.deathPlace) : null,
    occupation: input.occupation ? String(input.occupation) : null,
    education: input.education ? String(input.education) : null,
    phone: input.phone ? String(input.phone) : null,
    email: input.email ? String(input.email) : null,
    address: input.address ? String(input.address) : null,
    biography: input.biography ? String(input.biography) : null,
    notes: input.notes ? String(input.notes) : null,
    profilePhotoId: input.profilePhotoId ? String(input.profilePhotoId) : null,
    status: (input.status as 'LIVING' | 'DECEASED' | 'UNKNOWN' | 'ARCHIVED') ?? 'LIVING',
    isArchived: Boolean(input.isArchived ?? false),
    createdBy: input.createdBy ? String(input.createdBy) : null,
    updatedBy: input.updatedBy ? String(input.updatedBy) : null,
  };

  return memberData;
};

const buildMemberUpdateData = (input: Record<string, unknown>) => {
  const updateData: Prisma.FamilyMemberUpdateInput = {
    fullName: input.fullName === undefined ? undefined : input.fullName ? String(input.fullName) : null,
    gender: input.gender === undefined ? undefined : input.gender ? String(input.gender) : null,
    dateOfBirth: input.dateOfBirth === undefined ? undefined : normalizeNullableDate(typeof input.dateOfBirth === 'string' ? input.dateOfBirth : null),
    birthDatePrecision: input.birthDatePrecision === undefined ? undefined : (String(input.birthDatePrecision) as any),
    birthPlace: input.birthPlace === undefined ? undefined : input.birthPlace ? String(input.birthPlace) : null,
    dateOfDeath: input.dateOfDeath === undefined ? undefined : normalizeNullableDate(typeof input.dateOfDeath === 'string' ? input.dateOfDeath : null),
    deathDatePrecision: input.deathDatePrecision === undefined ? undefined : (String(input.deathDatePrecision) as any),
    deathPlace: input.deathPlace === undefined ? undefined : input.deathPlace ? String(input.deathPlace) : null,
    occupation: input.occupation === undefined ? undefined : input.occupation ? String(input.occupation) : null,
    education: input.education === undefined ? undefined : input.education ? String(input.education) : null,
    phone: input.phone === undefined ? undefined : input.phone ? String(input.phone) : null,
    email: input.email === undefined ? undefined : input.email ? String(input.email) : null,
    address: input.address === undefined ? undefined : input.address ? String(input.address) : null,
    biography: input.biography === undefined ? undefined : input.biography ? String(input.biography) : null,
    notes: input.notes === undefined ? undefined : input.notes ? String(input.notes) : null,
    profilePhotoId: input.profilePhotoId === undefined ? undefined : input.profilePhotoId ? String(input.profilePhotoId) : null,
    status: input.status === undefined ? undefined : (input.status as 'LIVING' | 'DECEASED' | 'UNKNOWN' | 'ARCHIVED'),
    isArchived: input.isArchived === undefined ? undefined : Boolean(input.isArchived),
    updatedBy: input.updatedBy === undefined ? undefined : input.updatedBy ? String(input.updatedBy) : null,
  };

  if (input.familyId) {
    updateData.family = { connect: { id: String(input.familyId) } };
  }

  return updateData;
};

export const listFamilyMembers = async (familyId?: string) => {
  const where = familyId ? { familyId } : undefined;

  return prisma.familyMember.findMany({
    where,
    orderBy: [{ fullName: 'asc' }],
  });
};

export const getFamilyMemberById = async (id: string) => {
  return prisma.familyMember.findUnique({
    where: { id },
  });
};

export const createFamilyMember = async (input: Record<string, unknown>) => {
  const familyId = String(input.familyId);
  const familyExists = await prisma.family.findUnique({ where: { id: familyId } });

  if (!familyExists) {
    throw new Error('FAMILY_NOT_FOUND');
  }

  return prisma.familyMember.create({
    data: buildMemberData(input),
  });
};

export const updateFamilyMember = async (id: string, input: Record<string, unknown>) => {
  const existingMember = await prisma.familyMember.findUnique({ where: { id } });

  if (!existingMember) {
    throw new Error('FAMILY_MEMBER_NOT_FOUND');
  }

  if (input.familyId) {
    const familyExists = await prisma.family.findUnique({ where: { id: String(input.familyId) } });
    if (!familyExists) {
      throw new Error('FAMILY_NOT_FOUND');
    }
  }

  return prisma.familyMember.update({
    where: { id },
    data: buildMemberUpdateData(input),
  });
};

export const archiveFamilyMember = async (id: string, updatedBy?: string | null) => {
  const existingMember = await prisma.familyMember.findUnique({ where: { id } });

  if (!existingMember) {
    throw new Error('FAMILY_MEMBER_NOT_FOUND');
  }

  return prisma.familyMember.update({
    where: { id },
    data: {
      status: 'ARCHIVED',
      isArchived: true,
      updatedBy: updatedBy ?? existingMember.updatedBy,
    },
  });
};

export const permanentlyDeleteFamilyMember = async (id: string) => {
  const existingMember = await prisma.familyMember.findUnique({ where: { id } });
  if (!existingMember) throw new Error('FAMILY_MEMBER_NOT_FOUND');

  await prisma.$transaction(async (transaction) => {
    await transaction.parentChildRelationship.deleteMany({ where: { OR: [{ parentId: id }, { childId: id }] } });
    await transaction.marriage.deleteMany({ where: { OR: [{ person1Id: id }, { person2Id: id }] } });
    await transaction.familyMember.delete({ where: { id } });
  });

  return existingMember;
};

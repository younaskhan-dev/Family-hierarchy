import { z } from 'zod';

const dateValue = z.union([
  z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date'),
  z.null(),
  z.undefined(),
]);

export const familyMemberSchema = z.object({
  familyId: z.string().trim().min(1, 'familyId is required'),
  fullName: z.string().trim().max(200).nullable().optional(),
  gender: z.string().trim().max(20).nullable().optional().default('Male'),
  dateOfBirth: dateValue.optional(),
  birthDatePrecision: z.enum(['EXACT', 'APPROXIMATE', 'YEAR_ONLY', 'UNKNOWN']).default('UNKNOWN'),
  birthPlace: z.string().nullable().optional(),
  dateOfDeath: dateValue.optional(),
  deathDatePrecision: z.enum(['EXACT', 'APPROXIMATE', 'YEAR_ONLY', 'UNKNOWN']).default('UNKNOWN'),
  deathPlace: z.string().nullable().optional(),
  occupation: z.string().trim().max(200).nullable().optional(),
  education: z.string().nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  email: z.string().trim().max(255).nullable().optional(),
  address: z.string().nullable().optional(),
  biography: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  profilePhotoId: z.string().trim().nullable().optional(),
  status: z.enum(['LIVING', 'DECEASED', 'UNKNOWN', 'ARCHIVED']).default('LIVING'),
  isArchived: z.boolean().default(false),
  createdBy: z.string().trim().nullable().optional(),
  updatedBy: z.string().trim().nullable().optional(),
});

export const updateFamilyMemberSchema = familyMemberSchema.partial();

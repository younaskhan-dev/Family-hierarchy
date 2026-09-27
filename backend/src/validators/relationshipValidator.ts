import { z } from 'zod';

export const parentChildRelationshipSchema = z.object({
  familyId: z.string().trim().min(1, 'familyId is required'),
  parentId: z.string().trim().min(1, 'parentId is required'),
  childId: z.string().trim().min(1, 'childId is required'),
  relationshipType: z.enum(['BIOLOGICAL', 'ADOPTIVE', 'STEP', 'UNKNOWN']).default('BIOLOGICAL'),
  notes: z.string().nullable().optional(),
  createdBy: z.string().trim().nullable().optional(),
});

const dateValue = z.union([
  z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date'),
  z.null(),
  z.undefined(),
]);

export const marriageSchema = z.object({
  familyId: z.string().trim().min(1, 'familyId is required'),
  person1Id: z.string().trim().min(1, 'person1Id is required'),
  person2Id: z.string().trim().min(1, 'person2Id is required'),
  marriageDate: dateValue.optional(),
  marriageDatePrecision: z.enum(['EXACT', 'APPROXIMATE', 'YEAR_ONLY', 'UNKNOWN']).default('UNKNOWN'),
  marriagePlace: z.string().nullable().optional(),
  endDate: dateValue.optional(),
  endDatePrecision: z.enum(['EXACT', 'APPROXIMATE', 'YEAR_ONLY', 'UNKNOWN']).default('UNKNOWN'),
  status: z.enum(['ACTIVE', 'ENDED', 'DIVORCED', 'WIDOWED', 'UNKNOWN']).default('ACTIVE'),
  notes: z.string().nullable().optional(),
  createdBy: z.string().trim().nullable().optional(),
  updatedBy: z.string().trim().nullable().optional(),
});

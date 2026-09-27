import { z } from 'zod';

const dateValue = z.union([
  z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date'),
  z.null(),
  z.undefined(),
]);

export const importantDateSchema = z.object({
  familyId: z.string().trim().min(1, 'familyId is required'),
  memberId: z.string().trim().nullable().optional(),
  title: z.string().trim().min(1, 'title is required').max(200),
  date: dateValue.optional(),
  datePrecision: z.enum(['EXACT', 'APPROXIMATE', 'YEAR_ONLY', 'UNKNOWN']).default('UNKNOWN'),
  type: z.enum(['BIRTHDAY', 'WEDDING_ANNIVERSARY', 'DEATH_ANNIVERSARY', 'CUSTOM']).default('CUSTOM'),
  notes: z.string().nullable().optional(),
});

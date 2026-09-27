import { z } from 'zod';

const dateValue = z.union([
  z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date'),
  z.null(),
  z.undefined(),
]);

export const eventSchema = z.object({
  familyId: z.string().trim().min(1, 'familyId is required'),
  title: z.string().trim().min(1, 'title is required').max(200),
  type: z.enum(['WEDDING', 'REUNION', 'GATHERING', 'MEMORIAL', 'MEETING', 'HISTORICAL_EVENT', 'CUSTOM']).default('CUSTOM'),
  eventDate: dateValue.optional(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  createdBy: z.string().trim().nullable().optional(),
});

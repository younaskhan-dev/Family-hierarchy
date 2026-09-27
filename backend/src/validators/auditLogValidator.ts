import { z } from 'zod';

export const auditLogSchema = z.object({
  userId: z.string().trim().nullable().optional(),
  action: z.string().trim().min(1, 'action is required').max(80),
  entityType: z.string().trim().min(1, 'entityType is required').max(100),
  entityId: z.string().trim().nullable().optional(),
  familyId: z.string().trim().nullable().optional(),
  oldValues: z.any().nullable().optional(),
  newValues: z.any().nullable().optional(),
  metadata: z.any().nullable().optional(),
});

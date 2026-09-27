import { z } from 'zod';

export const photoMetadataSchema = z.object({
  familyId: z.string().trim().min(1, 'familyId is required'),
  memberId: z.string().trim().nullable().optional(),
  fileName: z.string().trim().min(1, 'fileName is required').max(255),
  description: z.string().nullable().optional(),
  storageUrl: z.string().trim().min(1, 'storageUrl is required'),
  storagePublicId: z.string().trim().max(255).nullable().optional(),
  uploadedBy: z.string().trim().nullable().optional(),
});

export const documentMetadataSchema = z.object({
  familyId: z.string().trim().min(1, 'familyId is required'),
  memberId: z.string().trim().nullable().optional(),
  title: z.string().trim().min(1, 'title is required').max(200),
  fileName: z.string().trim().min(1, 'fileName is required').max(255),
  fileType: z.string().trim().max(100).nullable().optional(),
  fileSize: z.number().int().nonnegative().nullable().optional(),
  storageUrl: z.string().trim().min(1, 'storageUrl is required'),
  description: z.string().nullable().optional(),
  uploadedBy: z.string().trim().nullable().optional(),
});

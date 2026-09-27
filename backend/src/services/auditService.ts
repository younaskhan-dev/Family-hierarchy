import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

export const createAuditLog = async (input: Record<string, unknown>) => {
  const userId = typeof input.userId === 'string' ? input.userId : undefined;
  const familyId = typeof input.familyId === 'string' ? input.familyId : undefined;

  const payload: Prisma.AuditLogCreateInput = {
    action: String(input.action ?? ''),
    entityType: String(input.entityType ?? ''),
    entityId: typeof input.entityId === 'string' ? input.entityId : undefined,
    oldValues: input.oldValues == null ? Prisma.JsonNull : (input.oldValues as Prisma.InputJsonValue),
    newValues: input.newValues == null ? Prisma.JsonNull : (input.newValues as Prisma.InputJsonValue),
    metadata: input.metadata == null ? Prisma.JsonNull : (input.metadata as Prisma.InputJsonValue),
    ...(userId ? { user: { connect: { id: userId } } } : {}),
    ...(familyId ? { family: { connect: { id: familyId } } } : {}),
  };

  return prisma.auditLog.create({ data: payload });
};

export const listAuditLogs = async (familyId?: string) => {
  return prisma.auditLog.findMany({
    where: familyId ? { familyId } : undefined,
    orderBy: { timestamp: 'desc' },
    take: 50,
  });
};

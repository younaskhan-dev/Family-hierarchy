import prisma from '../lib/prisma.js';

export const hasFamilyAccess = async (userId: string, familyId: string) => {
  const access = await prisma.userFamilyAccess.findUnique({
    where: {
      userId_familyId: {
        userId,
        familyId,
      },
    },
    select: { id: true },
  });

  return Boolean(access);
};

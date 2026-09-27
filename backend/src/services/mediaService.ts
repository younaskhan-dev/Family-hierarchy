import prisma from '../lib/prisma.js';

const serializeDocument = (document: any) => ({
  ...document,
  fileSize: document.fileSize === null || document.fileSize === undefined ? null : Number(document.fileSize),
});

export const listPhotos = async (familyId?: string) => {
  return prisma.photo.findMany({
    where: familyId ? { familyId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
};

export const listDocuments = async (familyId?: string) => {
  const documents = await prisma.document.findMany({
    where: familyId ? { familyId } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return documents.map((document) => serializeDocument(document));
};

export const createPhotoMetadata = async (input: Record<string, unknown>) => {
  const familyId = String(input.familyId);
  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) throw new Error('FAMILY_NOT_FOUND');

  if (input.memberId) {
    const member = await prisma.familyMember.findFirst({ where: { id: String(input.memberId), familyId } });
    if (!member) throw new Error('MEMBER_NOT_FOUND');
  }

  return prisma.photo.create({
    data: {
      familyId,
      memberId: typeof input.memberId === 'string' ? input.memberId : null,
      fileName: String(input.fileName),
      description: typeof input.description === 'string' ? input.description : null,
      storageUrl: String(input.storageUrl),
      storagePublicId: typeof input.storagePublicId === 'string' ? input.storagePublicId : null,
      uploadedBy: typeof input.uploadedBy === 'string' ? input.uploadedBy : null,
    },
  });
};

export const createDocumentMetadata = async (input: Record<string, unknown>) => {
  const familyId = String(input.familyId);
  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) throw new Error('FAMILY_NOT_FOUND');

  if (input.memberId) {
    const member = await prisma.familyMember.findFirst({ where: { id: String(input.memberId), familyId } });
    if (!member) throw new Error('MEMBER_NOT_FOUND');
  }

  const createdDocument = await prisma.document.create({
    data: {
      familyId,
      memberId: typeof input.memberId === 'string' ? input.memberId : null,
      title: String(input.title),
      fileName: String(input.fileName),
      fileType: typeof input.fileType === 'string' ? input.fileType : null,
      fileSize: typeof input.fileSize === 'number' ? BigInt(input.fileSize) : null,
      storageUrl: String(input.storageUrl),
      description: typeof input.description === 'string' ? input.description : null,
      uploadedBy: typeof input.uploadedBy === 'string' ? input.uploadedBy : null,
    },
  });

  return serializeDocument(createdDocument);
};

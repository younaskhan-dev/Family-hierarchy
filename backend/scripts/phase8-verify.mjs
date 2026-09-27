import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const family = await prisma.family.create({
    data: {
      name: 'Phase 8 Validation Family',
      description: 'Validation family for media metadata checks',
      status: 'ACTIVE',
    },
  });

  const member = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Media',
      lastName: 'Member',
      status: 'LIVING',
    },
  });

  const photoResponse = await fetch('http://localhost:5000/api/media/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: family.id,
      memberId: member.id,
      fileName: 'avatar.png',
      storageUrl: 'https://example.com/avatar.png',
      uploadedBy: member.id,
    }),
  });

  console.log(`PHOTO_STATUS=${photoResponse.status}`);
  console.log(await photoResponse.text());

  const documentResponse = await fetch('http://localhost:5000/api/media/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: family.id,
      memberId: member.id,
      title: 'Birth Certificate',
      fileName: 'birth.pdf',
      storageUrl: 'https://example.com/birth.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      uploadedBy: member.id,
    }),
  });

  console.log(`DOCUMENT_STATUS=${documentResponse.status}`);
  console.log(await documentResponse.text());
} finally {
  const family = await prisma.family.findFirst({ where: { name: 'Phase 8 Validation Family' } });
  if (family) {
    await prisma.photo.deleteMany({ where: { familyId: family.id } });
    await prisma.document.deleteMany({ where: { familyId: family.id } });
    await prisma.familyMember.deleteMany({ where: { familyId: family.id } });
    await prisma.family.delete({ where: { id: family.id } });
  }
  await prisma.$disconnect();
}

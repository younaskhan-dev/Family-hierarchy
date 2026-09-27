import prisma from '../lib/prisma.js';

const getFamilyMemberSummary = (member: any) => ({
  id: member.id,
  familyId: member.familyId,
  fullName: member.fullName ?? null,
  status: member.status,
  isArchived: member.isArchived,
});

const collectParents = async (memberId: string) => {
  const rows = await prisma.parentChildRelationship.findMany({
    where: { childId: memberId },
    include: { parent: true },
    orderBy: { createdAt: 'asc' },
  });

  return rows.map((row) => ({
    relationshipType: row.relationshipType,
    ...getFamilyMemberSummary(row.parent),
  }));
};

const collectChildren = async (memberId: string) => {
  const rows = await prisma.parentChildRelationship.findMany({
    where: { parentId: memberId },
    include: { child: true },
    orderBy: { createdAt: 'asc' },
  });

  return rows.map((row) => ({
    relationshipType: row.relationshipType,
    ...getFamilyMemberSummary(row.child),
  }));
};

const collectSpouses = async (memberId: string) => {
  const rows = await prisma.marriage.findMany({
    where: {
      OR: [{ person1Id: memberId }, { person2Id: memberId }],
    },
    include: { person1: true, person2: true },
    orderBy: { createdAt: 'asc' },
  });

  return rows.map((row) => {
    const spouse = row.person1Id === memberId ? row.person2 : row.person1;
    return {
      marriageStatus: row.status,
      marriageDate: row.marriageDate,
      ...getFamilyMemberSummary(spouse),
    };
  });
};

const collectSiblings = async (memberId: string, familyId: string) => {
  const parentRows = await prisma.parentChildRelationship.findMany({
    where: { childId: memberId, familyId },
    select: { parentId: true },
  });

  if (parentRows.length === 0) {
    return [];
  }

  const parentIds = [...new Set(parentRows.map((row) => row.parentId))];

  const siblingRows = await prisma.parentChildRelationship.findMany({
    where: {
      familyId,
      parentId: { in: parentIds },
      childId: { not: memberId },
    },
    include: { child: true },
  });

  const deduped = new Map<string, any>();
  for (const row of siblingRows) {
    if (!deduped.has(row.child.id)) {
      deduped.set(row.child.id, {
        relationshipType: row.relationshipType,
        ...getFamilyMemberSummary(row.child),
      });
    }
  }

  return [...deduped.values()].sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''));
};

const collectAncestors = async (memberId: string, familyId: string) => {
  const seen = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: memberId, depth: 0 }];
  const ancestors: Array<{ id: string; depth: number }> = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const parentRows = await prisma.parentChildRelationship.findMany({
      where: { childId: current.id, familyId },
      include: { parent: true },
    });

    for (const parentRow of parentRows) {
      if (seen.has(parentRow.parent.id)) continue;
      seen.add(parentRow.parent.id);
      ancestors.push({ id: parentRow.parent.id, depth: current.depth + 1 });
      queue.push({ id: parentRow.parent.id, depth: current.depth + 1 });
    }
  }

  const details = await prisma.familyMember.findMany({
    where: { id: { in: ancestors.map((item) => item.id) }, familyId },
  });

  return details.map((member) => ({
    ...getFamilyMemberSummary(member),
    depth: ancestors.find((item) => item.id === member.id)?.depth ?? 0,
  }));
};

const collectDescendants = async (memberId: string, familyId: string) => {
  const seen = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: memberId, depth: 0 }];
  const descendants: Array<{ id: string; depth: number }> = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const childRows = await prisma.parentChildRelationship.findMany({
      where: { parentId: current.id, familyId },
      include: { child: true },
    });

    for (const childRow of childRows) {
      if (seen.has(childRow.child.id)) continue;
      seen.add(childRow.child.id);
      descendants.push({ id: childRow.child.id, depth: current.depth + 1 });
      queue.push({ id: childRow.child.id, depth: current.depth + 1 });
    }
  }

  const details = await prisma.familyMember.findMany({
    where: { id: { in: descendants.map((item) => item.id) }, familyId },
  });

  return details.map((member) => ({
    ...getFamilyMemberSummary(member),
    depth: descendants.find((item) => item.id === member.id)?.depth ?? 0,
  }));
};

export const getFamilyTreeForMember = async (memberId: string) => {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
    include: { family: true },
  });

  if (!member) {
    throw new Error('FAMILY_MEMBER_NOT_FOUND');
  }

  const [parents, children, spouses, siblings, ancestors, descendants] = await Promise.all([
    collectParents(memberId),
    collectChildren(memberId),
    collectSpouses(memberId),
    collectSiblings(memberId, member.familyId),
    collectAncestors(memberId, member.familyId),
    collectDescendants(memberId, member.familyId),
  ]);

  return {
    familyId: member.familyId,
    member: getFamilyMemberSummary(member),
    parents,
    children,
    spouses,
    siblings,
    ancestors,
    descendants,
    totalFamilyMembers: await prisma.familyMember.count({ where: { familyId: member.familyId } }),
  };
};

import prisma from '../src/lib/prisma.js';

type FamilyNode = {
  key: string;
  name: string;
  parent?: string;
  note?: string;
};

const nodes: FamilyNode[] = [];

const add = (key: string, name: string, parent?: string, note?: string) => {
  nodes.push({ key, name, parent, note });
};

add('0', 'Dosham Gul');
add('1', 'Gulzar Shah', '0');
add('1.1', 'Sher Ali Khan', '1');
add('1.1.1', 'Fazal Muhammad Khan', '1.1');
add('1.1.1.1', 'Gul Muhammad', '1.1.1');
add('1.1.1.1.1', 'Shoaib', '1.1.1.1');
add('1.1.1.1.2', 'Asif', '1.1.1.1');
add('1.1.1.1.3', 'Arsalan', '1.1.1.1');
add('1.1.1.2', 'Javed', '1.1.1');
add('1.1.1.2.1', 'Rayan', '1.1.1.2');
add('1.1.1.3', 'Bilal', '1.1.1');
add('1.1.2', 'Faqer', '1.1');
add('1.1.2.1', 'Taj Muhammad', '1.1.2');
add('1.1.2.1.1', 'Shahzad', '1.1.2.1');
add('1.1.2.1.2', 'Khalid', '1.1.2.1');
add('1.1.2.1.3', 'Yasir', '1.1.2.1');
add('1.1.2.1.4', 'Dawood', '1.1.2.1');
add('1.1.2.2', 'Shad Muhammad', '1.1.2');
add('1.1.2.2.1', 'Huzaifa', '1.1.2.2');
add('1.1.2.3', 'Niyaz Muhammad', '1.1.2');
add('1.1.2.3.1', 'Umar', '1.1.2.3');
add('1.1.2.4', 'Rasheed', '1.1.2');
add('1.1.2.5', 'Ali Khan', '1.1.2');
add('1.1.3', 'Haider', '1.1');
add('1.1.3.1', 'Muhammad', '1.1.3');
add('1.1.3.1.1', '[Name missing]', '1.1.3.1', 'Name was missing in the supplied source tree.');
add('1.1.4', 'Raza Muhammad', '1.1');
add('1.1.4.1', 'Ishfaq', '1.1.4');
add('1.1.4.2', 'Zeeshan', '1.1.4');
add('1.1.5', 'Muhammad Ali', '1.1');
add('1.2', 'Muhammad Zareen', '1');
add('1.2.1', 'Bahtee Rawan', '1.2', 'Spelling requires verification.');
add('1.2.1.1', 'Ayub Khan', '1.2.1');
add('1.2.1.2', 'Zanaullah', '1.2.1');
add('1.2.1.3', 'Shafiullah', '1.2.1');
add('1.2.2', 'Muhammad Sher', '1.2');
add('1.2.2.1', 'Farooq', '1.2.2');
add('1.2.2.2', 'Zia-ur-Rehman', '1.2.2');
add('1.2.2.3', 'Farhan', '1.2.2');
add('1.2.2.4', 'Azlan', '1.2.2');
add('1.2.3', 'Khan Zada', '1.2');
add('1.2.3.1', 'Awais', '1.2.3', 'Spelling requires verification.');
add('1.2.3.2', 'Maaz', '1.2.3');
add('1.2.3.3', 'Maghaweya', '1.2.3', 'Spelling requires verification.');
add('1.2.4', 'Lal Muhammad', '1.2');
add('1.2.4.1', 'Yaseen', '1.2.4');
add('1.2.4.2', 'Hamid', '1.2.4');
add('1.2.5', 'Khasta Rahman', '1.2');
add('1.2.5.1', 'Sufiya', '1.2.5');
add('1.2.5.2', 'Jibran', '1.2.5');
add('1.2.6', 'Naseeb Raman', '1.2');
add('1.2.7', 'Muhammad', '1.2');
add('1.3', 'Alif Hassan', '1');
add('1.3.1', 'Khasta Zareen', '1.3');
add('1.3.1.1', 'Musa Khan', '1.3.1');
add('1.3.1.2', 'Hassan', '1.3.1');
add('1.3.1.3', 'Hussain', '1.3.1');
add('1.3.2', 'Kharoon', '1.3', 'Spelling requires verification.');
add('1.3.2.1', 'Sudais', '1.3.2');
add('1.3.3', 'Sahie', '1.3', 'Spelling requires verification.');
add('1.3.3.1', 'Ismayee', '1.3.3', 'Spelling requires verification.');
add('1.3.3.2', 'Imran', '1.3.3');
add('1.3.3.3', 'Amjad', '1.3.3');
add('1.4', 'Gul Shireen', '1');
add('1.4.1', 'Rahmanullah', '1.4');
add('1.4.2', 'Subkhan', '1.4');
add('1.5', 'Gul Hassan', '1');
add('1.5.1', 'Umar Zada', '1.5');
add('1.5.1.1', 'Muhammad Usman', '1.5.1');
add('1.5.1.2', 'Muhammad Nouman', '1.5.1');
add('1.5.1.3', 'Hamza', '1.5.1');
add('1.5.1.4', 'Hanzala', '1.5.1');
add('1.5.2', 'Shireen Zada', '1.5');
add('1.5.2.1', 'Ishaq Khan', '1.5.2');
add('1.5.2.2', 'Luqman Khan', '1.5.2');
add('1.5.2.3', 'Younas Khan', '1.5.2');
add('1.5.2.4', 'Zainullah', '1.5.2');
add('1.5.3', 'Zahir', '1.5');
add('1.5.3.1', 'Mustafa', '1.5.3');
add('1.5.3.2', 'Shams', '1.5.3');
add('1.5.4', 'Naseeb Zada', '1.5');
add('1.5.4.1', 'Kamal', '1.5.4');
add('1.5.5', 'Allepzar Khan', '1.5', 'Spelling requires verification.');
add('1.5.6', 'Naeem', '1.5');
add('1.5.6.1', 'Hamdan', '1.5.6');
add('1.5.6.2', 'Hassan', '1.5.6');
add('1.6', 'Samander', '1');
add('1.6.1', 'Muhammad Afzal', '1.6');
add('1.6.1.1', '[Name missing]', '1.6.1', 'Name was missing in the supplied source tree.');
add('1.6.2', 'Rafiq', '1.6');
add('1.6.3', 'Saeed Afzal', '1.6');

add('2', 'Khatab', '0');
add('2.1', 'Miaruf Khan', '2', 'Spelling requires verification.');
add('2.2', 'Muhammad Arif Khan', '2');

add('3', 'Wazer', '0');
add('3.1', 'Gulam Muhammad', '3');
add('3.1.1', 'Sulaiman', '3.1');
add('3.1.2', 'Binyamen', '3.1', 'Spelling requires verification.');
add('3.1.3', 'Najeeb', '3.1');
add('3.2', 'Muhammad Umar', '3');
add('3.2.1', 'Mir Alam', '3.2');
add('3.2.1.1', 'Inam', '3.2.1');
add('3.2.1.2', 'Talal Khan', '3.2.1');
add('3.2.2', 'Mir Aslam', '3.2');
add('3.2.2.1', 'Hamas', '3.2.2');
add('3.2.2.2', 'Arman', '3.2.2');
add('3.2.3', 'Ihsan', '3.2');
add('3.2.3.1', 'Zeelan', '3.2.3', 'Spelling requires verification.');
add('3.2.3.2', 'Zarar Khan', '3.2.3');
add('3.2.4', 'Sami', '3.2');
add('3.2.4.1', 'Jibran', '3.2.4');
add('3.2.4.2', 'Azan', '3.2.4');
add('3.2.5', 'Attaullah', '3.2');
add('3.2.5.1', 'Arbab', '3.2.5');
add('3.2.5.2', 'Hamayun', '3.2.5');
add('3.3', 'Hazrat Umar', '3');
add('3.3.1', 'Aayaf Khan', '3.3', 'Spelling requires verification.');
add('3.3.1.1', 'Nasir', '3.3.1');
add('3.3.1.2', 'Faizan', '3.3.1');
add('3.3.1.3', 'Mashall', '3.3.1', 'Spelling requires verification.');
add('3.3.2', 'Ismail', '3.3');
add('3.3.2.1', 'Muhammad', '3.3.2');

add('4', 'Fam Jan', '0', 'Spelling requires verification.');
add('4.1', 'Abdullah Bilal', '4', 'Spelling requires verification.');
add('4.2', 'Hazrat Bilal', '4');
add('4.2.1', 'Mia Shareef', '4.2');
add('4.2.2', '[Name missing]', '4.2', 'Name was missing in the supplied source tree.');
add('4.3', 'Moqeem', '4');
add('4.4', 'Bahtawar', '4');

add('5', 'Niyaz Noor', '0');
add('5.1', 'Saeed Kareem', '5');
add('5.2', 'Muhammad Kareem', '5');
add('5.3', 'Muhammad Kareem', '5', 'Duplicate name retained as a separate source entry; verify identity.');

add('6', 'Noor Zal', '0');
add('6.1', 'Fazal Hayat', '6');
add('6.2', 'Gul Raheem', '6');
add('6.2.1', 'Sheruzal', '6.2', 'Spelling requires verification.');
add('6.2.2', 'Merozal', '6.2', 'Spelling requires verification.');

const familyName = 'Family Hierarchy';
const sourceKey = (key: string) => `[source-key:${key}]`;

async function main() {
  const family = await prisma.family.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { name: familyName, description: 'Imported family hierarchy supplied on 2026-09-25.' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: familyName,
      description: 'Imported family hierarchy supplied on 2026-09-25.',
    },
  });

  const ids = new Map<string, string>();

  for (const node of nodes) {
    const notes = [sourceKey(node.key), node.note].filter(Boolean).join(' ');
    const existing = await prisma.familyMember.findFirst({
      where: { familyId: family.id, notes: { contains: sourceKey(node.key) } },
    });

    const member = existing
      ? await prisma.familyMember.update({
          where: { id: existing.id },
          data: { displayName: node.name, firstName: node.name, gender: 'Male', notes },
        })
      : await prisma.familyMember.create({
          data: {
            familyId: family.id,
            displayName: node.name,
            firstName: node.name,
            gender: 'Male',
            notes,
          },
        });

    ids.set(node.key, member.id);
  }

  for (const node of nodes.filter((item) => item.parent)) {
    const parentId = ids.get(node.parent as string);
    const childId = ids.get(node.key);
    if (!parentId || !childId) throw new Error(`Missing relationship target for ${node.key}`);

    await prisma.parentChildRelationship.upsert({
      where: {
        familyId_parentId_childId_relationshipType: {
          familyId: family.id,
          parentId,
          childId,
          relationshipType: 'BIOLOGICAL',
        },
      },
      update: {},
      create: { familyId: family.id, parentId, childId, relationshipType: 'BIOLOGICAL' },
    });
  }

  console.log(`Seeded ${nodes.length} members and ${nodes.filter((node) => node.parent).length} parent-child relationships.`);
  console.log(`Family ID: ${family.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

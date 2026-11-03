const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
  const passwordHash = await bcrypt.hash('TempPass123!', 10);
  
  // First find or create institution
  const institution = await prisma.institution.upsert({
    where: { code: 'ALLSAINTS' },
    update: {},
    create: {
      name: 'All Saints Mushililie',
      code: 'ALLSAINTS',
      type: 'SHARED',
      isActive: true,
    }
  });

  const users = [
    { email: 'principal@allsaintsmushililie.ac.ke', name: 'Principal', wing: 'SCHOOL' },
    { email: 'bursar@allsaintsmushililie.ac.ke', name: 'Bursar', wing: 'SCHOOL' },
    { email: 'teacher@allsaintsmushililie.ac.ke', name: 'Teacher', wing: 'SCHOOL' },
    { email: 'parent@allsaintsmushililie.ac.ke', name: 'Parent', wing: 'SCHOOL' },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        wing: u.wing,
        institutionId: institution.id,
        status: 'ACTIVE',
      }
    });
    console.log('Created:', user.email, '| password: TempPass123!');
  }

  await prisma.$disconnect();
}

createUsers().catch(e => console.error(e));
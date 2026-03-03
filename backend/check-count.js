const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function count() {
    const count = await prisma.problem.count();
    console.log('Total Problems:', count);
    await prisma.$disconnect();
}
count();

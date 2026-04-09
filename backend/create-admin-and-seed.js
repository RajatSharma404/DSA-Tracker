// Create or update admin user
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const admin = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: { role: "ADMIN" },
      create: {
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    console.log("✅ Admin user created/updated:");
    console.log(JSON.stringify(admin, null, 2));

    // Now seed the DSA content
    console.log("\n🌱 Now seeding DSA content...\n");

    const { seedComprehensiveDSA } = require("./dist/seedComprehensiveDSA");
    const result = await seedComprehensiveDSA();

    console.log("✅ DSA CONTENT SEEDED SUCCESSFULLY!\n");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const permissions = await prisma.sidebarPermission.findMany();
        console.log("Permissions found:", permissions);
    } catch (error) {
        console.error("Error accessing sidebarPermission:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();

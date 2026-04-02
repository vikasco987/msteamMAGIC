import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspectUntouched() {
  const leads = await prisma.formResponse.findMany({
    where: { 
      isTouched: false,
      OR: [
        { remarks: { some: {} } },
        { internalValues: { some: { value: { notIn: ["", "null", "undefined"] } } } }
      ]
    },
    include: {
      remarks: true,
      internalValues: true
    }
  });
  
  if (leads.length === 0) {
    console.log("No inconsistencies found: All isTouched:false leads are truly untouched.");
  } else {
    console.log(`Found ${leads.length} inconsistencies:`);
    console.log(JSON.stringify(leads, null, 2));
  }
}

inspectUntouched().finally(() => prisma.$disconnect());

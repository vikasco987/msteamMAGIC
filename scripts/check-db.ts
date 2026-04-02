import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 SHIVA'S CRM MATRIX INVESTIGATOR 🔍");
    console.log("------------------------------------");

    // 1. Fetch latest 5 remarks added
    const latestRemarks = await prisma.formRemark.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            responseId: true,
            remark: true,
            followUpStatus: true,
            leadStatus: true,
            createdAt: true,
            authorName: true,
            response: {
                select: { formId: true }
            }
        }
    });

    if (latestRemarks.length === 0) {
        console.log("❌ No remarks found in DB.");
        return;
    }

    for (const r of latestRemarks) {
        const formId = (r.response as any).formId;
        console.log(`\n📄 Interaction for Response ID: ${r.responseId.slice(-8)}`);
        console.log(`👤 Author: ${r.authorName} | 📅 ${r.createdAt}`);
        console.log(`💬 Remark Entry: "${r.remark}"`);
        console.log(`🏷️ Calls: [${r.followUpStatus || 'None'}] | Lead: [${r.leadStatus || 'None'}]`);

        // 2. Fetch the corresponding internal matrix values for this response
        // This simulates what the matrix/spreadsheet shows
        const values = await (prisma as any).internalValue.findMany({
            where: { responseId: r.responseId },
            include: { column: true }
        });

        // 3. Fetch ALL columns for this form to see what's available
        const allCols = await prisma.internalColumn.findMany({
            where: { formId: formId }
        });

        console.log(`📋 FORM COLUMNS (Total: ${allCols.length}):`);
        const groups = {
            STATUS: ["Status", "STATUS", "Follow-up Status", "Calling Status", "Lead Status", "CALLING STATUS", "LEAD STATUS", "Follow up Status"],
            REMARK: ["Recent Remark", "RECENT REMARK", "Remark", "Remarks", "Interaction Notes", "Note", "Notes"],
            DATE: ["Next Follow-up Date", "Next Interaction", "Follow up Date", "CALLING DATE", "NEXT DATE", "Followup Date", "Next Follow up Date"]
        };

        allCols.forEach(c => {
            const label = c.label.toLowerCase().trim();
            let matched = "❌ UNMAPPED";
            if (groups.STATUS.map(l => l.toLowerCase().trim()).includes(label)) matched = "✅ STATUS GROUP";
            else if (groups.REMARK.map(l => l.toLowerCase().trim()).includes(label)) matched = "✅ REMARK GROUP";
            else if (groups.DATE.map(l => l.toLowerCase().trim()).includes(label)) matched = "✅ DATE GROUP";
            else if (label.includes("calling date") || label.includes("today calling")) matched = "✅ TODAY CLOCK GROUP";
            
            console.log(`   🔹 '${c.label}' -> ${matched}`);
        });

        console.log("\n📊 CURRENT MATRIX VALUES:");
        const colMap = new Map(allCols.map(c => [c.id, c.label]));
        values.forEach((v: any) => {
            console.log(`   🔸 ${colMap.get(v.columnId)}: "${v.value}" (Synced by: ${v.updatedByName || 'N/A'})`);
        });
        console.log("-----------------------------------------");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

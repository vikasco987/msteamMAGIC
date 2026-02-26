import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";

const googleProvider = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

function renderReportTemplate(data: any) {
    if (!data) return "<div>No data available for report.</div>";

    const metricsHtml = (data.keyMetrics || []).map((m: any) => `
        <div style="flex: 1; min-width: 140px; background: white; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9; shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <p style="margin: 0; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">${m.label}</p>
            <p style="margin: 4px 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">${m.value}</p>
            ${m.trend ? `<p style="margin: 4px 0 0; font-size: 10px; font-weight: 700; color: ${m.trend.includes('+') ? '#10b981' : '#f43f5e'};">${m.trend}</p>` : ''}
        </div>
    `).join("");

    const insightsHtml = (data.insights || []).map((ins: any) => `
        <li style="margin-bottom: 8px; font-size: 13px; color: #475569;">• ${ins}</li>
    `).join("");

    return `
        <div style="font-family: system-ui, sans-serif; color: #1e293b; padding: 20px;">
            <header style="margin-bottom: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px;">
                <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a;">AI Intelligence Report</h1>
            </header>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">${metricsHtml}</div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; margin-bottom: 24px;">
                <h2 style="margin: 0 0 12px; font-size: 14px; font-weight: 800;">Summary</h2>
                <p style="margin: 0; font-size: 13px; line-height: 1.6;">${data.summary}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase;">Insights</h3>
                    <ul style="margin: 0; padding: 0; list-style: none;">${insightsHtml}</ul>
                </div>
                <div style="background: #eff6ff; padding: 16px; border-radius: 12px;">
                    <h3 style="font-size: 12px; font-weight: 800;">System Priority</h3>
                    <div style="display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 11px; font-weight: 800;">
                        ${data.priority}
                    </div>
                </div>
            </div>
        </div>
    `;
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    console.log(">>> AI REPORT ROUTE V4 (CACHED) ACTIVATED <<<");
    try {
        const { id: formId } = await context.params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { query, columns, rowData, forceRefresh } = await req.json();

        if (!columns || !rowData) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Check Cache
        if (!forceRefresh) {
            const cached = await prisma.aIAnalysis.findFirst({
                where: { formId, query: query || "default" },
                orderBy: { createdAt: 'desc' }
            });
            if (cached) return NextResponse.json({ html: cached.htmlReport, isCached: true });
        }

        // 2. Run AI
        const prompt = `Analyze this CRM data and return JSON.
        Columns: ${JSON.stringify(columns)}
        Data: ${JSON.stringify(rowData.slice(0, 100))}
        Return format: { "summary": "...", "keyMetrics": [...], "insights": [...], "priority": "...", "recommendations": [...] }`;

        const { text } = await generateText({
            model: googleProvider("gemini-flash-latest"),
            prompt: prompt,
            maxRetries: 0,
        });

        const cleanedJson = (text || "{}").replace(/```json/gi, "").replace(/```/g, "").trim();
        const analysisData = JSON.parse(cleanedJson);
        const html = renderReportTemplate(analysisData);

        // 3. Save Cache
        await prisma.aIAnalysis.create({
            data: {
                formId,
                query: query || "default",
                analysisData: analysisData as any,
                htmlReport: html
            }
        });

        return NextResponse.json({ html, isCached: false });
    } catch (error: any) {
        console.error("AI REPORT EXCEPTION:", error);
        return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}

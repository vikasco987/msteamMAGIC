import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: formId } = await context.params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { query, columns, rowData } = await req.json();

        if (!columns || !rowData) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCXro2IyzxnET3LFbdWobBR5MLyM41q3wI";
        if (!apiKey) {
            return NextResponse.json({
                error: "GEMINI_API_KEY is not configured in environment variables."
            }, { status: 500 });
        }

        const systemPrompt = `You are a world-class Data Analyst and UI Consultant.
Your goal is to analyze the provided tabular dataset and generate a beautifully formatted, insightful HTML report based on the user's request.

Data Columns:
${JSON.stringify(columns, null, 2)}

Data Rows (Top 50 to avoid limits):
${JSON.stringify(rowData.slice(0, 50), null, 2)}

User Request: "${query || 'Generate a comprehensive data summary report'}"

INSTRUCTIONS:
1. Analyze the data rigorously based on the request.
2. Generate the report in clean, modern, semantic HTML. Use inline CSS styles to make it look incredibly beautiful, using a Tailwind-like aesthetic (but use inline styles). E.g., Use flexbox, rounded corners, soft shadows, readable modern typography, and nice color gradients (e.g., text-indigo-600, bg-slate-50).
3. DO NOT use markdown. Return strictly valid HTML.
4. DO NOT wrap HTML in \`\`\`html or anything else. Just the raw HTML string.
5. Structure the report beautifully:
   - Make a nice header.
   - Use cards for key metrics.
   - Summarize findings clearly.
   - Highlight outliers or interesting trends if any.
   - Keep it professional, highly visual, and analytical.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        if (!response.ok) {
            console.error("Gemini API Error:", await response.text());
            return NextResponse.json({ error: "Failed to communicate with AI provider" }, { status: 500 });
        }

        const data = await response.json();
        let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "<div>Failed to generate report.</div>";

        // Clean up markdown block if AI accidentally uses it
        aiResponse = aiResponse.replace(/```html/gi, '').replace(/```/g, '').trim();

        return NextResponse.json({ html: aiResponse });
    } catch (error: any) {
        console.error("AI Report Error:", error);
        return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}

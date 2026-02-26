import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const googleProvider = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    console.log(">>> AI REPORT ROUTE V3 ACTIVATED <<<");
    try {
        const { id: formId } = await context.params;
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { query, columns, rowData } = await req.json();

        if (!columns || !rowData) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prompt = `You are a professional CRM data analyst.
        Columns: ${JSON.stringify(columns)}
        Analyze these records: ${JSON.stringify(rowData.slice(0, 50))}
        Request: ${query || "Analyze this data"}
        
        Generate a beautiful HTML report. Use inline styles for a premium dashboard look. 
        DO NOT use markdown or code blocks. Return ONLY valid HTML.`;

        const { text } = await generateText({
            model: googleProvider("gemini-flash-latest"),
            prompt: prompt,
            maxRetries: 0,
        });

        let aiResponse = text || "<div>No insights generated.</div>";
        aiResponse = aiResponse.replace(/```html/gi, "").replace(/```/g, "").trim();

        return NextResponse.json({ html: aiResponse });
    } catch (error: any) {
        console.error("AI REPORT EXCEPTION DETAILED:", JSON.stringify(error, null, 2));
        console.error("FULL ERROR OBJECT:", error);
        return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}

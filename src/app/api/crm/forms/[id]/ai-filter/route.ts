import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { query, columns } = await req.json();

        if (!query || !columns) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: "GEMINI_API_KEY is not configured in environment variables. Please add it to your .env file."
            }, { status: 500 });
        }

        const systemPrompt = `You are an AI assistant integrated into a Next.js/React datagrid CRM. 
Your goal is to convert natural language queries into a JSON array of filters.

Here are the available columns in the datagrid:
${JSON.stringify(columns, null, 2)}

You must return a valid JSON array of objects, where each object represents a filter condition.
If no filters can be determined or the query doesn't make sense, return an empty array: []

Return ONLY valid JSON. Do NOT wrap in markdown \`\`\`json. Just the raw array.

Filter Object Format (Match exactly):
{
  "columnId": "string (the id of the matched column)",
  "operator": "string (must be one of: contains, equals, starts_with, ends_with, not_equals, is_empty, is_not_empty, eq, gt, lt, gte, lte, between, today, yesterday, before, after, tomorrow, this_week)",
  "value": "string (the value to filter by)"
}

User Query: "${query}"`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }]
                }]
            })
        });

        if (!response.ok) {
            console.error("Gemini API Error:", await response.text());
            return NextResponse.json({ error: "Failed to communicate with AI provider" }, { status: 500 });
        }

        const data = await response.json();
        let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

        // Clean up potential markdown formatting from AI response
        aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        let filters = [];
        try {
            filters = JSON.parse(aiResponse);
        } catch (e) {
            console.error("Failed to parse AI response:", aiResponse);
            return NextResponse.json({ error: "AI returned invalid filter format" }, { status: 500 });
        }

        return NextResponse.json({ filters });
    } catch (error) {
        console.error("AI Filter Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

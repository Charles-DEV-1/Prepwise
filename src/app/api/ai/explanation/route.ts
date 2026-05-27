import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { question, options, correctAnswer, explanation, subject } = body;

    if (!question || !options || !correctAnswer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Build prompt
    const optionsText = Object.entries(options)
      .map(([key, value]) => `${key}. ${value}`)
      .join("\n");

    const prompt = `You are a friendly JAMB exam tutor helping a Nigerian student understand an exam question.

Subject: ${subject || "General"}
Question: ${question}
Options:
${optionsText}
Correct Answer: ${correctAnswer}. ${(options as Record<string, string>)[correctAnswer] ?? ""}
Basic Explanation: ${explanation}

Give a clear, simple explanation that a Nigerian SS3 student can understand. 
- Explain WHY the correct answer is right
- Explain why the other options are wrong (briefly)
- Use simple English, no jargon
- Keep it under 150 words
- Be encouraging and helpful`;

    // Call Groq API
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ API key not configured");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API error:", response.status, errorData);
      return NextResponse.json(
        { error: "Failed to generate AI explanation" },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const explanation_text =
      data.choices?.[0]?.message?.content ?? "Could not generate explanation.";

    return NextResponse.json({ explanation: explanation_text });
  } catch (error) {
    console.error("AI explanation error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

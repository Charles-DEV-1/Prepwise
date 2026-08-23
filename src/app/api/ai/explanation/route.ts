import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// llama-3.1-8b-instant was retired by Groq on 2026-08-16.
// Keep this overridable so a future provider model migration does not require code changes.
const MODEL = process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b";
const REQUEST_TIMEOUT_MS = 15_000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_QUESTION_LENGTH = 2_000;
const MAX_EXPLANATION_LENGTH = 2_000;
const MAX_SUBJECT_LENGTH = 80;
const MAX_OPTION_LENGTH = 500;
const MAX_OPTIONS = 8;

type ExplanationPayload = {
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation: string;
  subject: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var aiExplanationRateLimits: Map<string, RateLimitEntry> | undefined;
}

function getRateLimitStore() {
  globalThis.aiExplanationRateLimits ??= new Map<string, RateLimitEntry>();
  return globalThis.aiExplanationRateLimits;
}

function trimText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseOptions(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const entries = Object.entries(value)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .slice(0, MAX_OPTIONS)
    .map(([key, option]) => [
      key.trim().slice(0, 8),
      option.trim().slice(0, MAX_OPTION_LENGTH),
    ]);

  const options = Object.fromEntries(entries);
  return Object.keys(options).length > 0 ? options : null;
}

function parsePayload(body: unknown): ExplanationPayload | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const question = trimText(record.question, MAX_QUESTION_LENGTH);
  const options = parseOptions(record.options);
  const correctAnswer = trimText(record.correctAnswer, 8);
  const explanation = trimText(record.explanation, MAX_EXPLANATION_LENGTH);
  const subject = trimText(record.subject, MAX_SUBJECT_LENGTH) || "General";

  if (!question || !options || !correctAnswer) return null;
  if (!Object.hasOwn(options, correctAnswer)) return null;

  return {
    question,
    options,
    correctAnswer,
    explanation,
    subject,
  };
}

function checkRateLimit(userId: string) {
  const now = Date.now();
  const store = getRateLimitStore();
  const current = store.get(userId);

  if (!current || current.resetAt <= now) {
    store.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function buildPrompt(payload: ExplanationPayload) {
  const optionsText = Object.entries(payload.options)
    .map(([key, value]) => `${key}. ${value}`)
    .join("\n");

  return `You are a friendly JAMB exam tutor helping a Nigerian student understand an exam question.

Subject: ${payload.subject}
Question: ${payload.question}
Options:
${optionsText}
Correct Answer: ${payload.correctAnswer}. ${payload.options[payload.correctAnswer] ?? ""}
Basic Explanation: ${payload.explanation || "No explanation provided."}

Give a clear, simple explanation that a Nigerian SS3 student can understand.
- Explain WHY the correct answer is right
- Explain why the other options are wrong briefly
- Use simple English, no jargon
- Keep it under 150 words
- Be encouraging and helpful`;
}

function publicError(message: string, status: number, retryAfter?: number) {
  const response = NextResponse.json({ error: message }, { status });
  if (retryAfter) {
    response.headers.set("Retry-After", String(retryAfter));
  }
  return response;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("GROQ_API_KEY is missing.");
    return publicError("AI service is not configured.", 503);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return publicError("Unauthorized.", 401);
    }

    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return publicError(
        "Too many AI requests. Please try again later.",
        429,
        rateLimit.retryAfterSeconds,
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return publicError("Invalid request body.", 400);
    }

    const payload = parsePayload(body);
    if (!payload) {
      return publicError("Invalid explanation request.", 400);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: buildPrompt(payload) }],
          max_tokens: 220,
          temperature: 0.5,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        console.error("Groq API failed.", {
          status: response.status,
          statusText: response.statusText,
        });

        return publicError("AI service is temporarily unavailable.", 502);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const explanation =
        data.choices?.[0]?.message?.content?.trim() ||
        "Could not generate explanation.";

      return NextResponse.json({ explanation });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return publicError("AI service timed out. Please try again.", 504);
      }

      console.error(
        "AI provider request failed.",
        error instanceof Error ? error.message : String(error),
      );
      return publicError("AI service is temporarily unavailable.", 502);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error(
      "AI explanation route failed.",
      error instanceof Error ? error.message : String(error),
    );
    return publicError("AI explanation failed. Please try again.", 500);
  }
}

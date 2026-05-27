export async function getAIExplanation(
  question: string,
  options: Record<string, string>,
  correctAnswer: string,
  explanation: string,
  subject: string,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch("/api/ai/explanation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        options,
        correctAnswer,
        explanation,
        subject,
      }),
      signal: controller.signal,
    });

    const data = (await response.json().catch(() => null)) as {
      explanation?: string;
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(data?.error ?? "AI explanation failed.");
    }

    return data?.explanation?.trim() || "Could not generate explanation.";
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AI explanation timed out. Please try again.");
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Could not load AI explanation. Try again.",
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function getAIExplanation(
  question: string,
  options: Record<string, string>,
  correctAnswer: string,
  explanation: string,
  subject: string,
): Promise<string> {
  // Call backend API endpoint instead of calling Groq directly
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
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? "Failed to get AI explanation");
  }

  const data = (await response.json()) as {
    explanation?: string;
  };

  return data.explanation ?? "Could not generate explanation.";
}

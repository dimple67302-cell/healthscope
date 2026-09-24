import { NextRequest, NextResponse } from "next/server";
import { answerFromDataset } from "@/lib/chatbot";

export const runtime = "nodejs";

interface ChatRequestBody {
  message?: string;
  city?: string;
}

async function polishWithOpenAI(groundedAnswer: string, userMessage: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You are HealthScope Assistant. You must ONLY restate the facts given to you in 'GROUNDED_DATA'. Never invent hospital names, prices, ratings, doctors, or medical facts that are not present in GROUNDED_DATA. Keep the reply concise and friendly. If GROUNDED_DATA says data is unavailable, say so plainly.",
          },
          {
            role: "user",
            content: `User question: ${userMessage}\n\nGROUNDED_DATA:\n${groundedAnswer}\n\nRewrite GROUNDED_DATA as a natural, friendly reply. Do not add any fact not present above.`,
          },
        ],
        max_tokens: 400,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    return text?.trim() || null;
  } catch (err) {
    console.error("OpenAI polish failed, falling back to rule-based answer", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const message = (body.message ?? "").trim();

    if (!message) {
      return NextResponse.json(
        { reply: "Please type a question — for example: \"Show hospitals in Amritsar for heart treatment under 20000.\"" },
        { status: 200 }
      );
    }

    const groundedAnswer = answerFromDataset(message, body.city);
    const polished = await polishWithOpenAI(groundedAnswer, message);

    return NextResponse.json({
      reply: polished ?? groundedAnswer,
      source: polished ? "openai-grounded" : "rule-based",
    });
  } catch (err) {
    console.error("POST /api/chat failed", err);
    return NextResponse.json(
      { reply: "Something went wrong on my end. Please try again in a moment." },
      { status: 500 }
    );
  }
}

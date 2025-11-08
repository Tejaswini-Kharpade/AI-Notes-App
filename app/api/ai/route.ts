import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { action, content } = await req.json();

    if (!action || !content)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Replace with your real OpenAI key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
      return NextResponse.json({ error: "Missing OpenAI key" }, { status: 500 });

    // Prompt based on action
    let prompt = "";
    if (action === "summary")
      prompt = `Summarize this note briefly:\n${content}`;
    else if (action === "improve")
      prompt = `Improve this note's clarity and grammar:\n${content}`;
    else if (action === "tags")
      prompt = `Generate 3 relevant tags (comma-separated) for this note:\n${content}`;
    else
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    // Call OpenAI API
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await aiRes.json();
    const result = data.choices?.[0]?.message?.content || "No response";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}

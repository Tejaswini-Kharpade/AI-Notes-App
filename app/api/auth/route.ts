import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Note from "@/models/Note";
import { verifyJWT } from "@/authMiddleware"; // helper to get userId from JWT
import OpenAI from "openai";

// Connect to DB
connectMongoDB();


// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --------------------- CREATE NOTE ---------------------
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const userId = verifyJWT(token);
    if (!userId) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    const body = await req.json();
    const { title, content } = body;

    const note = await Note.create({ title, content, userId });
    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create note", details: err }, { status: 400 });
  }
}

// --------------------- GET NOTES ---------------------
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const userId = verifyJWT(token);
    if (!userId) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    const { search } = Object.fromEntries(req.nextUrl.searchParams);
    let query = { userId } as any;

    if (search) {
      query.title = { $regex: search, $options: "i" }; // case-insensitive search
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch notes", details: err }, { status: 500 });
  }
}

// --------------------- UPDATE NOTE ---------------------
export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const userId = verifyJWT(token);
    if (!userId) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    const body = await req.json();
    const { id, title, content } = body;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { title, content },
      { new: true }
    );

    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json(note);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update note", details: err }, { status: 400 });
  }
}

// --------------------- DELETE NOTE ---------------------
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const userId = verifyJWT(token);
    if (!userId) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    const { id } = Object.fromEntries(req.nextUrl.searchParams);
    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete note", details: err }, { status: 400 });
  }
}

// --------------------- AI FEATURES ---------------------
export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const userId = verifyJWT(token);
    if (!userId) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    const { id, action } = await req.json(); // action = "summary" | "improve" | "tags"
    const note = await Note.findOne({ _id: id, userId });
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    let prompt = "";
    if (action === "summary") {
      prompt = `Summarize the following note in 2-3 sentences:\n${note.content}`;
    } else if (action === "improve") {
      prompt = `Improve the grammar, clarity, and style of this note:\n${note.content}`;
    } else if (action === "tags") {
      prompt = `Generate 3-5 relevant tags for this note:\n${note.content}`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const aiResult = response.choices[0].message?.content;

    return NextResponse.json({ result: aiResult });
  } catch (err) {
    return NextResponse.json({ error: "AI request failed", details: err }, { status: 500 });
  }
}

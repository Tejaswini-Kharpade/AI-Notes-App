import express from "express";
import Note from "../models/Note";
import { protect } from "../authMiddleware";
import axios from "axios"; // add this at the top if not already


const router = express.Router();

// Create note
router.post("/", protect, async (req: any, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.create({ title, content, userId: req.userId });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: "Failed to create note" });
  }
});

// Get all notes for user
router.get("/", protect, async (req: any, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

export default router;




// // AI actions: summarize, improve, tags
// router.patch("/ai/:id", protect, async (req: any, res) => {
//   const { id } = req.params;
//   const { action } = req.body;

//   try {
//     const note = await Note.findById(id);
//     if (!note || note.userId.toString() !== req.userId) {
//       return res.status(404).json({ error: "Note not found" });
//     }

//     let prompt = "";
//     if (action === "summary") {
//       prompt = `Summarize the following text in 3-4 sentences:\n\n${note.content}`;
//     } else if (action === "improve") {
//       prompt = `Improve the clarity and writing quality of the following text:\n\n${note.content}`;
//     } else if (action === "tags") {
//       prompt = `Generate 5 short relevant tags for this note:\n\n${note.content}`;
//     } else {
//       return res.status(400).json({ error: "Invalid action" });
//     }

//     // Call OpenAI
//     const response = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-3.5-turbo",
//         messages: [{ role: "user", content: prompt }],
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//       }
//     );

//     const aiText = response.data.choices?.[0]?.message?.content || "No response";
//     res.json({ result: aiText });
//   } catch (err: any) {
//     console.error("AI action failed:", err.response?.data || err.message);
//     res.status(500).json({ error: "Failed to process AI action" });
//   }
// });

// export default router;

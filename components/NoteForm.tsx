"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface NoteFormProps {
  token: string;
  note?: { _id: string; title: string; content: string };
  onSuccess: () => void;
}

export default function NoteForm({ token, note, onSuccess }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (note) {
      // Edit note
      await fetch("/api/notes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: note._id, title, content }),
      });
    } else {
      // Create note
      await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
    }

    setTitle("");
    setContent("");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2 w-full max-w-md">
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <Button type="submit">{note ? "Update Note" : "Add Note"}</Button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // ✅ Fetch notes from the backend
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/auth?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setNotes(data);
      else setError(data.error || "Failed to fetch notes");
    } catch (err) {
      setError("Error fetching notes");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search]);

  // ✅ Add or Update a note
  const handleSaveNote = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = "/api/auth";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingId,
          title,
          content,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTitle("");
        setContent("");
        setEditingId(null);
        fetchNotes();
      } else {
        setError(data.error || "Failed to save note");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  // ✅ Delete a note
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/auth?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        fetchNotes();
      } else {
        setError(data.error || "Failed to delete note");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  // ✅ Start editing a note
  const handleEdit = (note: any) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note._id);
  };

  // ✅ AI Features: summarize, improve, tags
  const handleAIAction = async (id: string, action: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`${action.toUpperCase()} Result:\n\n${data.result}`);
      } else {
        alert(data.error || "AI request failed");
      }
    } catch (err) {
      alert("Something went wrong with AI request");
    }
  };



  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 tracking-tight text-gray-800 dark:text-gray-100">
        My Notes
      </h1>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={fetchNotes}>Search</Button>
      </div>

      {/* Add or Edit note */}
      <div className="flex flex-col gap-2 mb-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button onClick={handleSaveNote}>
          {editingId ? "Update Note" : "Add Note"}
        </Button>
        {editingId && (
          <Button
            variant="outline"
            onClick={() => {
              setEditingId(null);
              setTitle("");
              setContent("");
            }}
          >
            Cancel Edit
          </Button>
        )}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Notes list */}
      <div className="space-y-3">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note._id}
              className="border border-gray-300 rounded-xl p-4 shadow-sm hover:shadow-md transition mb-4"
            >
              <h2 className="font-semibold text-lg mb-2">{note.title}</h2>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {note.content}
              </p>

              {/* Buttons below note */}
              <div className="flex flex-wrap gap-3 justify-start mt-3">
                <Button
                  className="border border-gray-400 text-sm px-4 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleEdit(note)}
                >
                  Edit
                </Button>

                <Button
                  className="border border-gray-400 text-sm px-4 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
                  onClick={() => handleDelete(note._id)}
                >
                  Delete
                </Button>

                <Button
                  className="border border-gray-400 text-sm px-4 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleAIAction(note._id, "summary")}
                >
                  Summarize
                </Button>

                <Button
                  className="border border-gray-400 text-sm px-4 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleAIAction(note._id, "improve")}
                >
                  Improve
                </Button>

                <Button
                  className="border border-gray-400 text-sm px-4 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleAIAction(note._id, "tags")}
                >
                  Tags
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No notes yet</p>
        )}
      </div>
    </div>
  );
}

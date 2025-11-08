"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard"); // redirect if already logged in
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to AI Note App</h1>
      <p className="mb-6 text-center max-w-md">
        Keep your notes organized and enhanced with AI features like summaries, 
        grammar improvements, and auto-generated tags.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => router.push("/login")}>Login</Button>
        <Button onClick={() => router.push("/register")}>Register</Button>
      </div>
    </div>
  );
}

// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB(); // ensure DB connection

    const { username, email, password }: {
      username: string;
      email: string;
      password: string;
    } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const user: IUser = await User.create({ username, email, password });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      message: "User registered successfully",
      token,
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

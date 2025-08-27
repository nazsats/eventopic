import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, role, experience } = await request.json();
    // Add logic to handle form data (e.g., save to database or email)
    console.log("Staff Application:", { name, email, role, experience });
    // Example: Integrate with an email service or database
    return NextResponse.json({ message: "Application submitted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();
    // Add logic to handle form data (e.g., send to email service or database)
    console.log("Client Inquiry:", { name, email, message });
    // Example: Integrate with an email service like SendGrid or save to a database
    return NextResponse.json({ message: "Inquiry submitted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}
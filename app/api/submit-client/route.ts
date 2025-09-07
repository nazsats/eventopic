import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Add your email submission logic here (e.g., using Nodemailer or a service like Resend)
    // Example: await sendEmail(body);
    console.log('Client form submitted:', body); // For debugging
    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
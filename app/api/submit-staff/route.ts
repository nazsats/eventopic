// Updated api/submit-staff/route.ts (Note: This path seems inconsistent; assuming it's app/api/submit-staff/route.ts for Next.js App Router consistency)
// Changes: No changes needed for theme. Added logging for chatbot submissions.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Add your email submission logic here (e.g., using Nodemailer or a service like Resend)
    // Example: await sendEmail(body);
    console.log('Staff form or chatbot submitted:', body); // For debugging
    return NextResponse.json({ success: true, message: 'Application submitted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
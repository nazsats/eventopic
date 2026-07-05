import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, FieldValue } from '../../../lib/firebaseAdmin';
import { validateClientLead, sanitizeText } from '../../../lib/validation';
import { rateLimit, RATE_LIMITS, getRateLimitHeaders } from '../../../lib/rateLimit';

// Public client/inquiry form — no login required. Spam-guarded by rate limit
// + validation, written via the Admin SDK (bypasses Firestore rules safely).
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.PUBLIC_API);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();

    // The form sends `phone`; validation expects `mobile`. Map it.
    let validatedData;
    try {
      validatedData = validateClientLead({ ...body, mobile: body.mobile ?? body.phone });
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid input data' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    await getAdminDb().collection('leads').add({
      name: validatedData.name,
      email: validatedData.email,
      mobile: validatedData.mobile,
      company: validatedData.company || '',
      message: validatedData.message || '',
      eventType: body.eventType ? sanitizeText(String(body.eventType), 60) : '',
      eventDate: body.date ? sanitizeText(String(body.date), 40) : '',
      preferredTime: body.time ? sanitizeText(String(body.time), 20) : '',
      createdAt: FieldValue.serverTimestamp(),
      status: 'new',
      source: 'contact_form',
    });

    return NextResponse.json(
      { success: true, message: 'Inquiry submitted successfully' },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Submit client lead error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

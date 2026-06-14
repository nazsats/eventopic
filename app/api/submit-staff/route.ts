import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, FieldValue } from '../../../lib/firebaseAdmin';
import { validateStaffInquiry, sanitizeText } from '../../../lib/validation';
import { rateLimit, RATE_LIMITS, getRateLimitHeaders } from '../../../lib/rateLimit';

// Public "join the team" form — no login required. Rate limited + validated,
// written via the Admin SDK (bypasses Firestore rules safely).
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
      validatedData = validateStaffInquiry({ ...body, mobile: body.mobile ?? body.phone });
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid input data' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    await getAdminDb().collection('staff_inquiries').add({
      name: validatedData.name,
      email: validatedData.email,
      mobile: validatedData.mobile,
      message: validatedData.message || '',
      role: body.role ? sanitizeText(String(body.role), 60) : '',
      experience: body.experience ? sanitizeText(String(body.experience), 40) : '',
      createdAt: FieldValue.serverTimestamp(),
      status: 'pending',
      source: 'join_team_form',
    });

    return NextResponse.json(
      { success: true, message: 'Application submitted successfully' },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Submit staff inquiry error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}

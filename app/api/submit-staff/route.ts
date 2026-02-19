import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { requireAuth, createAuthErrorResponse } from '../../../lib/auth';
import { validateStaffInquiry } from '../../../lib/validation';
import { rateLimit, RATE_LIMITS, getRateLimitHeaders } from '../../../lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // 1. Apply rate limiting (10 requests per minute)
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.PUBLIC_API);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // 2. Verify authentication
    let user;
    try {
      user = await requireAuth(request);
    } catch (authError) {
      const { error, status } = createAuthErrorResponse(authError);
      return NextResponse.json(
        { error },
        {
          status,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();

    let validatedData;
    try {
      validatedData = validateStaffInquiry(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid input data' },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // 4. Save to Firestore with only whitelisted fields
    await addDoc(collection(db, "staff_inquiries"), {
      name: validatedData.name,
      email: validatedData.email,
      mobile: validatedData.mobile,
      message: validatedData.message || '',
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
      status: 'pending',
      source: 'join_team_form'
    });

    return NextResponse.json(
      { success: true, message: 'Application submitted successfully' },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );

  } catch (error) {
    console.error("Submit staff inquiry error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
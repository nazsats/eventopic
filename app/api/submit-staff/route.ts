import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.mobile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save to Firestore 'staff_inquiries' collection
    await addDoc(collection(db, "staff_inquiries"), {
      ...body,
      createdAt: serverTimestamp(),
      status: 'pending',
      source: 'join_team_form'
    });

    return NextResponse.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
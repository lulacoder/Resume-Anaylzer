import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/actions';

export async function POST(request: NextRequest) {
  await signOut();
  return NextResponse.redirect(new URL('/', request.url));
}
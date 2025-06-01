import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Completely disabled middleware
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Exclude admin and dashboard from middleware
export const config = {
  matcher: ['/((?!admin|dashboard|api|_next/static|_next/image|favicon.ico).*)'],
};

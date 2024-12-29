import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
    // Check if the request is from the same origin to prevent CSRF attacks
    const originHeader = request.headers.get('Origin');
    const hostHeader = request.headers.get('Host');
    if (originHeader === null || hostHeader === null) {
        return new NextResponse(null, { status: 403 });
    }
    let origin: URL;
    try {
        origin = new URL(originHeader);
    } catch (e) {
        return new NextResponse(null, { status: 403 });
    }
    if (origin.hostname !== hostHeader) {
        return new NextResponse(null, { status: 403 });
    }
    return NextResponse.next();
}

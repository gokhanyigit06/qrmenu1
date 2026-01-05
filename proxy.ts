import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function proxy(req: NextRequest) {
    const url = req.nextUrl;
    let hostname = req.headers.get("host") || '';
    hostname = hostname.replace(':3000', '');

    // Allow core domains
    if (
        hostname.includes("vercel.app") ||
        hostname.includes("localhost")
    ) {
        return NextResponse.next();
    }

    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

    // Rewrite to /c/[domain]/[path]
    // Example: incoming menu.botin.com/foo -> internal /c/menu.botin.com/foo
    return NextResponse.rewrite(new URL(`/c/${hostname}${path}`, req.url));
}

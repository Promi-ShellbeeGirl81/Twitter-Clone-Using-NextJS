import { NextResponse } from "next/server";

export function middleware(req) {
    const nextauth = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");

    if (!nextauth) {
        return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/home/:path*', '/notifications/:path*'],
};

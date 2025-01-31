import { NextResponse } from "next/server";

export function middleware(req){
    const {nextauth} = req.cookies;
    if(!nextauth){
        return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
} 

export const config = {
    matcher: ['/home'],
};

import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";

export function proxy(request) {
  if (getSessionCookie(request)) return NextResponse.next();

  const loginURL = new URL("/login", request.url);
  loginURL.searchParams.set(
    "returnTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginURL);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/add-studio/:path*",
    "/my-listings/:path*",
    "/studios/edit/:path*",
    "/my-bookings/:path*",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("admin_auth");
  const isAuth = authCookie?.value === "authenticated";
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (isLoginPage && isAuth) {
    return NextResponse.redirect(new URL("/admin/contacts", request.url));
  }

  if (!isLoginPage && !isAuth && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};

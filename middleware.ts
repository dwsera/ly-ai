import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("next-auth.session-token")?.value;
  console.log("Middleware - Path:", req.nextUrl.pathname, "Token:", token); // 添加调试日志

  const protectedRoutes = ["/create", "/", "/cc", "/reply", "/dashboard/:path*", "/jg", "/xhs"];

  if (protectedRoutes.includes(req.nextUrl.pathname) && !token) {
    console.log("Middleware - Redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create", "/", "/cc", "/reply", "/dashboard/:path*", "/jg", "/xhs"],
};
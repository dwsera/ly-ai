import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // 使用 getToken 获取会话
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("Middleware - Path:", req.nextUrl.pathname, "Token:", token);

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
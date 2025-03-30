import { NextRequest, NextResponse } from "next/server";

// 中间件保护受保护的路由
export function middleware(req: NextRequest) {
  const token = req.cookies.get("next-auth.session-token")?.value; // 获取 JWT token

  // 需要保护的页面路径
  const protectedRoutes = [
    "/create",
    "/",
    "/cc",
    "/reply",
    "/dashboard/:path*",
    "/jg",
    "/xhs",
  ];
  // const protectedRoutes = [""];

  if (protectedRoutes.includes(req.nextUrl.pathname) && !token) {
    return NextResponse.redirect(new URL("/login", req.url)); // 如果没有 token 则重定向到登录页面
  }

  return NextResponse.next(); // 如果有 token，继续请求
}

// 只对受保护的页面生效
export const config = {
  matcher: [
    "/create",
    "/",
    "/cc",
    "/reply",
    "/dashboard/:path*",
    "/jg",
    "/xhs",
  ],
  // matcher: [],
};

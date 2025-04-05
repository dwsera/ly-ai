import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client/edge"; // 使用 Edge 兼容版本
import { auth } from "@/lib/auth"; // 从你的 auth 配置中导入

const prisma = new PrismaClient();
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  const session = await auth(); // 使用 auth 获取会话
  if (!session || !session.user?.id || session.user.id !== userId) {
    return NextResponse.json(
      { message: "未登录或无权限访问" },
      { status: 401 }
    );
  }

  try {
    const itineraries = await prisma.itinerary.findMany({
      where: { userId },
    });

    return NextResponse.json(itineraries, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("获取行程列表失败:", error);
    return NextResponse.json(
      {
        message: "获取行程列表失败",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client/edge"; // 使用 Edge 兼容版本
import { auth } from "@/lib/auth"; // 从你的 auth 配置中导入

const prisma = new PrismaClient();
export const runtime = "edge";

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const session = await auth(); // 使用 auth 获取会话
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "未登录或无权限访问" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ message: "缺少行程ID" }, { status: 400 });
  }

  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary || itinerary.userId !== session.user.id) {
      return NextResponse.json(
        { message: "行程不存在或无权限删除" },
        { status: 403 }
      );
    }

    await prisma.itinerary.delete({
      where: { id },
    });

    return NextResponse.json({ message: "行程删除成功" }, { status: 200 });
  } catch (error) {
    console.error("删除行程失败:", error);
    return NextResponse.json(
      {
        message: "删除行程失败",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
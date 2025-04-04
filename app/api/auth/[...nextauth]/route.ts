// app/api/auth/[...nextauth]/route.ts

export const runtime = 'edge';  // 启用边缘运行时

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // 从外部导入配置

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
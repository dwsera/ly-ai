import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client/edge";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          throw new Error("邮箱和密码不能为空");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("用户名错误");
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("密码错误");
        }

        return { id: user.id, email: user.email, username: user.username };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 天
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? ""; // 如果 undefined，则使用空字符串
        token.email = user.email ?? "";
        token.username = user.username ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.email = token.email ?? "";
        session.user.username = token.username ?? "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn({ user }) {
      console.log("User signed in:", user);
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  jwt: {
    async encode({ secret, token }) {
      const encoder = new TextEncoder();
      const data = JSON.stringify(token);
      return btoa(String.fromCharCode(...encoder.encode(data))); // Base64 编码
    },
    async decode({ secret, token }) {
      if (!token) {
        return null;
      }
      const decoder = new TextDecoder();
      const binary = atob(token);
      const uint8Array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        uint8Array[i] = binary.charCodeAt(i);
      }
      return JSON.parse(decoder.decode(uint8Array));
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
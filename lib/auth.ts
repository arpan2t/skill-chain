import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

interface CustomUser {
  id: string;
  name: string;
  email: string;
  user_type: number;
  is_verified: number;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      user_type: number;
      is_verified: number;
    };
  }

  interface User extends CustomUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    user_type: number;
    is_verified: number;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          user_type: user.user_type,
          is_verified: user.is_verified,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.user_type = user.user_type;
        token.is_verified = user.is_verified;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name || null;
        session.user.email = session.user.email;
        session.user.user_type = token.user_type;
        session.user.is_verified = token.is_verified;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
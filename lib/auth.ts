import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import { Client } from "postmark"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db as any),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(env.POSTMARK_API_TOKEN && env.SMTP_FROM
      ? [
          EmailProvider({
            from: env.SMTP_FROM,
            sendVerificationRequest: async ({ identifier, url, provider }) => {
              const postmarkClient = new Client(env.POSTMARK_API_TOKEN!)
              const result = await postmarkClient.sendEmailWithTemplate({
                TemplateAlias: "magic-link",
                To: identifier,
                From: provider.from as string,
                TemplateModel: {
                  action_url: url,
                  product_name: siteConfig.name,
                },
              })
              if (result.ErrorCode) {
                throw new Error(result.Message)
              }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: { email: token.email ?? undefined },
      })
      if (!dbUser) {
        if (user) token.id = user.id
        return token
      }
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      }
    },
  },
}


import NextAuth from "next-auth";
import { NextAuthResult } from "next-auth";
import { D1Adapter } from "@auth/d1-adapter";
import GitHub from "next-auth/providers/github";
import resend from "next-auth/providers/resend";

export const runtime = "edge";

const authResult = (): NextAuthResult => {
    return NextAuth({
        providers: [
            resend({
                apiKey: process.env.AUTH_RESEND_KEY,
                from: process.env.AUTH_EMAIL_FROM,
            }),
            GitHub({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET }),
        ],
        adapter: D1Adapter(process.env.db),
    })
};

export const { handlers, signIn, signOut, auth } = authResult();
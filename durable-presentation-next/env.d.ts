// Generated by Wrangler
// by running `wrangler types --env-interface CloudflareEnv env.d.ts`

interface CloudflareEnv {
    db: D1Database;
    AUTH_SECRET: string;
    AUTH_RESEND_KEY: string;
    AUTH_EMAIL_FROM: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
}

namespace NodeJS {
  interface ProcessEnv {
    NEON_DB_URL: string;
    REDIS_DB_URL: string;

    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    NEXT_AUTH_SECRET: string;

    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;

    NEXT_PUBLIC_SITE_URL: string;
    NEXT_PUBLIC_FREE_PLAN_MAX_APPS: number;
    NEXT_PUBLIC_FREE_PLAN_MAX_FILES: number;
  }
}

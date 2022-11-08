declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MIKRO_ORM_ALLOW_GLOBAL_CONTEXT: string;
      MIKRO_ORM_DYNAMIC_IMPORTS: string;
      NODE_ENV: string;
      REDIS_URL: string;
      DATABASE_URL: string;
      PORT: string;
      SESSION_SECRET: string;
      CORS_ORIGIN: string;
    }
  }
}

export {}

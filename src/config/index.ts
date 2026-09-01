/**
 * Central application configuration loaded from environment variables.
 */
export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  auth: {
    secret: process.env.AUTH_SECRET!,
    url: process.env.AUTH_URL || 'http://localhost:3000',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY!,
  },
  app: {
    name: 'Buddy',
    description: 'Multi-Provider AI Chat & Research Workspace',
    isProduction: process.env.NODE_ENV === 'production',
  },
} as const;

import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// .env.local 우선 로드 후 .env 보조 로드
config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      process.env.POSTGRES_PRISMA_URL ??
      '',
  },
  verbose: true,
  strict: true,
});

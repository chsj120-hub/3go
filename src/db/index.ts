import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export type AppDatabase = NeonHttpDatabase<typeof schema>;

let cachedDb: AppDatabase | null = null;

/**
 * Neon Serverless PostgreSQL 연결 여부를 반환합니다.
 * 공모전 시연 중 DATABASE_URL이 미설정된 상태에서도 앱이 크래시되지 않도록 확인용 헬퍼를 제공합니다.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

/**
 * Neon HTTP 클라이언트 기반 Drizzle ORM 싱글톤 인스턴스를 반환합니다.
 * 모든 서버 컴포넌트, Route Handler, 서버 액션은 반드시 이 함수를 통해 DB에 접근합니다.
 */
export function getDb(): AppDatabase {
  if (cachedDb) {
    return cachedDb;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL 환경 변수가 설정되지 않았습니다. .env.local 파일에 Neon PostgreSQL 연결 문자열을 입력해 주세요.',
    );
  }

  const sql = neon(databaseUrl);
  cachedDb = drizzle(sql, { schema });
  return cachedDb;
}

/**
 * DATABASE_URL이 설정된 경우에만 Drizzle 인스턴스를 반환하고,
 * 미설정 시 null을 반환하여 메모리/스냅샷 Fallback으로 안전하게 전환할 수 있게 합니다.
 */
export function getOptionalDb(): AppDatabase | null {
  if (!isDatabaseConfigured()) {
    return null;
  }
  return getDb();
}

/**
 * 즉시 사용 가능한 기본 Drizzle 인스턴스.
 * 환경 변수가 없는 빌드/시연 프리뷰 환경에서는 getOptionalDb() 사용을 권장합니다.
 */
export const db: AppDatabase | null = getOptionalDb();

export { schema };

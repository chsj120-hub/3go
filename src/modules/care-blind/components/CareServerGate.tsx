import { cookies } from 'next/headers';
import { ShieldAlert } from 'lucide-react';
import { CareBlindHub } from './CareBlindHub';

/**
 * 서버 측 1차 역할 검증 게이트 (Server Component).
 * `3go_demo_role` 쿠키가 ASSOCIATE(준회원)이면 서버 렌더링 단계에서
 * 민감 데이터 조회 없이 403 차단 배너와 함께 클라이언트 이중 가드로 전달합니다.
 */
export async function CareServerGate() {
  const cookieStore = await cookies();
  const serverRole = cookieStore.get('3go_demo_role')?.value ?? 'REGULAR';
  const isServerBlocked = serverRole === 'ASSOCIATE';

  return (
    <div className="space-y-3">
      {isServerBlocked && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border-2 border-[#C2410C] bg-orange-50 px-3.5 py-2.5 text-xs font-bold text-[#9A3412]"
        >
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            서버 보안 검증(403): 현재 쿠키 등급(준회원)은 3단계 데이터를 수신할
            수 없습니다.
          </span>
        </div>
      )}
      <CareBlindHub />
    </div>
  );
}

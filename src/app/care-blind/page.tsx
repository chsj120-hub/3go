import { Suspense } from 'react';
import { CareServerGate } from '@/modules/care-blind/components/CareServerGate';

export default function CareBlindAliasPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-bold text-[#555555]">
          3단계 이어지GO 정회원 보안 권한을 확인하고 있습니다...
        </div>
      }
    >
      <CareServerGate />
    </Suspense>
  );
}

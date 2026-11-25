import type { UserRole } from '@/db/schema';

export interface DemoUserProfile {
  id: string;
  nickname: string;
  role: UserRole;
  roleLabel: string;
  shortDesc: string;
  badgeColorClass: string;
  gpsVerified: boolean;
  isCriminalCheckApproved: boolean;
}

/** 공모전 시연용 4종 역할 프로필 (src/db/seed.ts 데모 계정과 1:1 일치) */
export const DEMO_USERS: Record<UserRole, DemoUserProfile> = {
  ASSOCIATE: {
    id: 'demo-associate',
    nickname: '새싹이웃 민수',
    role: 'ASSOCIATE',
    roleLabel: '준회원',
    shortDesc: '3단계 이어지GO 완전 비노출(Blind) 상태 확인',
    badgeColorClass: 'bg-slate-100 text-slate-700 border-slate-300',
    gpsVerified: false,
    isCriminalCheckApproved: false,
  },
  REGULAR: {
    id: 'demo-regular',
    nickname: '첨단동 맥가이버',
    role: 'REGULAR',
    roleLabel: '정회원',
    shortDesc: 'GPS·성범죄조회 완료 · 3단계 이어지GO 활성화',
    badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gpsVerified: true,
    isCriminalCheckApproved: true,
  },
  TF_LEADER: {
    id: 'demo-tf-leader',
    nickname: '쌍암호수 원정대장',
    role: 'TF_LEADER',
    roleLabel: 'TF팀장',
    shortDesc: '단임 실행팀장 · 예산 품의 및 AI 회의록 작성',
    badgeColorClass: 'bg-orange-50 text-orange-700 border-orange-200',
    gpsVerified: true,
    isCriminalCheckApproved: true,
  },
  OFFICIAL: {
    id: 'demo-official',
    nickname: '광산 마을지원관',
    role: 'OFFICIAL',
    roleLabel: '공무원',
    shortDesc: '순환직 행정 멘토 · 품의 승인 및 e호조 변환',
    badgeColorClass: 'bg-blue-50 text-blue-900 border-blue-200',
    gpsVerified: true,
    isCriminalCheckApproved: true,
  },
};

export const DEMO_ROLE_ORDER: UserRole[] = [
  'ASSOCIATE',
  'REGULAR',
  'TF_LEADER',
  'OFFICIAL',
];

/** 정회원 이상(3단계 이어지GO 접근 가능) 여부 판별 */
export function isRegularOrAbove(role: UserRole): boolean {
  return role === 'REGULAR' || role === 'TF_LEADER' || role === 'OFFICIAL';
}

/** TF팀장·공무원 행정 기능 접근 가능 여부 판별 */
export function isAdminOrLeader(role: UserRole): boolean {
  return role === 'TF_LEADER' || role === 'OFFICIAL';
}

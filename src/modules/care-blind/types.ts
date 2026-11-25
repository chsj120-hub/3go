import type { SosCategory, SosStatus } from '@/db/schema';

export type BackgroundCheckStatus = 'approved' | 'unverified';

export interface SosBoardItem {
  id: string;
  authorId: string;
  authorNickname: string;
  category: SosCategory;
  title: string;
  description: string;
  locationHint: string;
  status: SosStatus;
  createdAt: string;
  requiresBackgroundCheck: boolean;
}

export interface PatrolCrewItem {
  id: string;
  title: string;
  routeSummary: string;
  schedule: string;
  safetyGrade: string;
  currentMembers: number;
  maxMembers: number;
  agencyNote: string;
}

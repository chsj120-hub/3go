import type { ProgramStage } from '@/db/schema';

export interface CommunityClassItem {
  id: string;
  stage: ProgramStage;
  title: string;
  category: string;
  agencyName: string;
  location: string;
  description: string;
  maxCapacity: number;
  currentApplicants: number;
  eventDateLabel: string;
  monthTag?: string;
  isZeroFee: boolean;
  isResidentProposed?: boolean;
}

export interface CommunityPageData {
  stage1Classes: CommunityClassItem[];
  stage2Calendar: CommunityClassItem[];
  dataSource: 'NEON_DB' | 'DEMO_SNAPSHOT';
}

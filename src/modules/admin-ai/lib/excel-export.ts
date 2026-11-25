import * as XLSX from 'xlsx';
import type { BudgetItem, TargetAccountingSystem } from '@/db/schema';

export interface ProposalExportInput {
  id: string;
  title: string;
  targetSystem: TargetAccountingSystem;
  status: string;
  totalAmount: number;
  itemsJson: BudgetItem[];
}

/**
 * 공개 예산 품의 내역을 e호조 / 에듀파인 공공 회계 전산 표준 컬럼(.xlsx)으로
 * 즉시 변환해 브라우저에서 다운로드합니다.
 */
export function downloadAccountingExcel(proposal: ProposalExportInput): string {
  const systemLabel =
    proposal.targetSystem === 'EDUFINE' ? '에듀파인' : 'e호조';

  const rows = proposal.itemsJson.map((item, idx) => ({
    순번: idx + 1,
    연동시스템: systemLabel,
    품의건명: proposal.title,
    품목명: item.itemName,
    규격: item.spec,
    수량: item.quantity,
    '단가(원)': item.unitPrice,
    '금액(원)': item.amount,
    산출기초: item.basis,
    구매처링크: item.purchaseUrl,
    비고: item.note ?? '',
  }));

  // 합계 행 추가
  rows.push({
    순번: rows.length + 1,
    연동시스템: systemLabel,
    품의건명: '합계',
    품목명: `총 ${proposal.itemsJson.length}개 품목`,
    규격: '-',
    수량: proposal.itemsJson.reduce((acc, cur) => acc + cur.quantity, 0),
    '단가(원)': 0,
    '금액(원)': proposal.totalAmount,
    산출기초: `승인 상태: ${proposal.status}`,
    구매처링크: '-',
    비고: '우리동네 3GO 공개 품의 자동 변환',
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 36 },
    { wch: 24 },
    { wch: 20 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 },
    { wch: 28 },
    { wch: 28 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${systemLabel}_품의내역`);

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${systemLabel}_예산품의서_${today}.xlsx`;
  XLSX.writeFile(workbook, filename);
  return filename;
}

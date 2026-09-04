import { InterestMethod } from '../types';

export interface MemberRecord {
  id: string;
  memberNo: string; // Nomor Anggota (e.g. KOP-001)
  name: string;
  nik: string;
  phone: string;
  address: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalLoansCount?: number;
  totalActiveLoanAmount?: number;
}

export interface MemberLoanRecord {
  id: string;
  loanNo: string; // Nomor Pinjaman (e.g. PJ-2026-001)
  memberId: string;
  memberName: string;
  memberNo: string;
  principal: number;
  annualRate: number;
  tenorMonths: number;
  method: InterestMethod;
  startDate: string;
  monthlyInstallment: number;
  purpose: string; // Keperluan Pinjaman (e.g. Modal Usaha, Pertanian, dll)
  status: 'ACTIVE' | 'PAID_OFF' | 'OVERDUE';
  disbursementDate: string;
  remainingBalance: number;
  notes?: string;
}

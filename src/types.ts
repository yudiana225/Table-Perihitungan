export type InterestMethod = 'FLAT' | 'EFEKTIF' | 'ANUITAS';

export type TableStyleTheme =
  | 'classic-official' // Format Baku Resmi Cetak (Kuning + Merah + Border Hitam Standar Koperasi/Bank)
  | 'executive-navy'   // Executive Corporate (Deep Navy & Slate Indigo)
  | 'emerald-fintech'  // Digital Banking Modern (Emerald Teal & Light Grid)
  | 'clean-minimal';   // Minimalist Monochrome (High Contrast Crisp Slate)

export type TableDensity = 'compact' | 'comfortable';

export type FeeType = 'FIXED' | 'PERCENTAGE';
export type FeeCategory = 'ADMIN' | 'PROVISI' | 'ASURANSI' | 'METERAI' | 'LAINNYA';

export interface LoanFee {
  id: string;
  name: string;
  category: FeeCategory;
  type: FeeType; // FIXED = Rp, PERCENTAGE = % dari pokok pinjaman
  value: number;
  enabled: boolean;
  notes?: string;
}

export interface FeeBreakdownItem {
  fee: LoanFee;
  amount: number;
}

export interface LoanParams {
  nominal: number;
  annualRate: number;
  tenorMonths: number;
  startMonth: number; // 0-indexed: 0 = Januari, 8 = September
  startYear: number;
  method: InterestMethod;
  paymentTiming: string;
  lenderName: string;
  lenderIdentity: string;
  lenderAddress: string;
  borrowerName: string;
  borrowerTitle: string;
  borrowerOrganization: string;
  signCity: string;
  signDateDay: string;
  signDateMonth: string;
  signDateYear: number;
  fees?: LoanFee[];
}

export interface InstallmentRow {
  no: number;
  monthName: string;
  year: number;
  dateLabel: string;
  principal: number;
  interest: number;
  total: number;
  remainingPrincipal: number;
}

export interface LoanCalculationResult {
  rows: InstallmentRow[];
  totalPrincipal: number;
  totalInterest: number;
  totalPayment: number;
  monthlyInstallment: number; // For flat/annuity or average for effective
  firstMonthInstallment: number;
  lastMonthInstallment: number;
  monthlyRate: number;
  effectiveRateDisplay: string;
  feeBreakdown: FeeBreakdownItem[];
  totalFees: number;
  netDisbursement: number; // Nominal - totalFees
  totalCostOfLoan: number; // TotalPayment + totalFees
}


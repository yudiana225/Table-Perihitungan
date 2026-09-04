import React, { useState, useMemo } from 'react';
import { LoanParams, LoanFee } from './types';
import { MemberRecord, MemberLoanRecord } from './types/memberTypes';
import { calculateLoan } from './utils/calculator';
import { LoanForm } from './components/LoanForm';
import { OfficialTableDocument } from './components/OfficialTableDocument';
import { StatsDashboard } from './components/StatsDashboard';
import { WorkflowFlowchart } from './components/WorkflowFlowchart';
import { MemberManager } from './components/MemberManager';
import { MemberLoanManager } from './components/MemberLoanManager';
import { DailyMonthlyInterest } from './components/DailyMonthlyInterest';
import {
  Calculator,
  GitBranch,
  Layers,
  Users,
  DollarSign,
  Menu,
  X,
  Building2,
  ChevronRight,
  ShieldCheck,
  Percent,
  Clock,
} from 'lucide-react';

const INITIAL_MEMBERS: MemberRecord[] = [
  {
    id: 'mem-1',
    memberNo: 'KOP-001',
    name: 'Arkadeus Hamudin',
    nik: '3171012304850001',
    phone: '0812-8899-7711',
    address: 'Jl. Cempaka Putih Tengah No. 12, Jakarta Pusat',
    joinDate: '2024-01-15',
    status: 'ACTIVE',
  },
  {
    id: 'mem-2',
    memberNo: 'KOP-002',
    name: 'Budi Santoso',
    nik: '3172041208900003',
    phone: '0813-4567-8901',
    address: 'Jl. Rawamangun Muka No. 45, Jakarta Timur',
    joinDate: '2024-03-10',
    status: 'ACTIVE',
  },
  {
    id: 'mem-3',
    memberNo: 'KOP-003',
    name: 'Siti Rahmawati',
    nik: '3173055506920002',
    phone: '0857-1234-5678',
    address: 'Jl. Kebon Jeruk Raya No. 88, Jakarta Barat',
    joinDate: '2024-06-20',
    status: 'ACTIVE',
  },
];

const INITIAL_MEMBER_LOANS: MemberLoanRecord[] = [
  {
    id: 'loan-1',
    loanNo: 'PJ-2026-001',
    memberId: 'mem-1',
    memberName: 'Arkadeus Hamudin',
    memberNo: 'KOP-001',
    principal: 100000000,
    annualRate: 14,
    tenorMonths: 12,
    method: 'FLAT',
    startDate: '2026-09-01',
    disbursementDate: '2026-08-25',
    monthlyInstallment: 9500000,
    purpose: 'Modal Kerja Pengadaan Unit Koperasi',
    status: 'ACTIVE',
    remainingBalance: 100000000,
    notes: 'Penyaluran dari dana PMK Investor 2026.',
  },
  {
    id: 'loan-2',
    loanNo: 'PJ-2026-002',
    memberId: 'mem-2',
    memberName: 'Budi Santoso',
    memberNo: 'KOP-002',
    principal: 25000000,
    annualRate: 12,
    tenorMonths: 10,
    method: 'ANUITAS',
    startDate: '2026-09-01',
    disbursementDate: '2026-08-28',
    monthlyInstallment: 2639000,
    purpose: 'Modal Usaha Bengkel & Suku Cadang',
    status: 'ACTIVE',
    remainingBalance: 25000000,
    notes: 'Angsuran lancar via autodebet payroll.',
  },
];

const DEFAULT_FEES: LoanFee[] = [
  {
    id: 'fee-admin-1',
    category: 'ADMIN',
    name: 'biaya admin',
    type: 'FIXED',
    value: 500000,
    enabled: true,
  },
  {
    id: 'fee-provisi-1',
    category: 'PROVISI',
    name: 'biaya profinsi',
    type: 'PERCENTAGE',
    value: 1.0,
    enabled: true,
  },
  {
    id: 'fee-asuransi-1',
    category: 'ASURANSI',
    name: 'biaya asuransi',
    type: 'PERCENTAGE',
    value: 0.5,
    enabled: true,
  },
  {
    id: 'fee-meterai-1',
    category: 'METERAI',
    name: 'biaya matre (1.2.3 Lmbr)',
    type: 'FIXED',
    value: 20000,
    enabled: true,
  },
];

const DEFAULT_PARAMS: LoanParams = {
  nominal: 100000000,
  annualRate: 14,
  tenorMonths: 12,
  startMonth: 8, // September (0-indexed: 8)
  startYear: 2026,
  method: 'FLAT',
  paymentTiming: 'SETIAP AKHIR BULAN',
  lenderName: '0',
  lenderIdentity: '0',
  lenderAddress: '',
  borrowerName: 'Arkadeus Hamudin',
  borrowerTitle: 'Ketua Koperasi Konsumen Karyawan',
  borrowerOrganization: 'PT. transportasi Jakarta',
  signCity: 'Jakarta',
  signDateDay: '',
  signDateMonth: '',
  signDateYear: 2026,
  fees: DEFAULT_FEES,
};

const EMPTY_PARAMS: LoanParams = {
  nominal: 0,
  annualRate: 0,
  tenorMonths: 0,
  startMonth: new Date().getMonth(),
  startYear: new Date().getFullYear(),
  method: 'FLAT',
  paymentTiming: '',
  lenderName: '',
  lenderIdentity: '',
  lenderAddress: '',
  borrowerName: '',
  borrowerTitle: '',
  borrowerOrganization: '',
  signCity: '',
  signDateDay: '',
  signDateMonth: '',
  signDateYear: new Date().getFullYear(),
  fees: [],
};

export default function App() {
  const [params, setParams] = useState<LoanParams>(DEFAULT_PARAMS);
  const [activeTab, setActiveTab] = useState<
    'CALCULATOR' | 'MEMBERS' | 'LOANS' | 'FLOWCHART' | 'INTEREST_CALC' | 'ALL'
  >('CALCULATOR');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence for Members and Member Loans
  const [members, setMembers] = useState<MemberRecord[]>(INITIAL_MEMBERS);
  const [memberLoans, setMemberLoans] = useState<MemberLoanRecord[]>(INITIAL_MEMBER_LOANS);

  const calculationResult = useMemo(() => {
    return calculateLoan(params);
  }, [params]);

  const handleReset = () => {
    setParams(EMPTY_PARAMS);
  };

  // Member CRUD handlers
  const handleAddMember = (newMemData: Omit<MemberRecord, 'id'>) => {
    const newMember: MemberRecord = {
      ...newMemData,
      id: `mem-${Date.now()}`,
    };
    setMembers((prev) => [newMember, ...prev]);
  };

  const handleUpdateMember = (updated: MemberRecord) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    // Also update any matching loans with the new member name/no
    setMemberLoans((prev) =>
      prev.map((l) =>
        l.memberId === updated.id
          ? { ...l, memberName: updated.name, memberNo: updated.memberNo }
          : l
      )
    );
  };

  const handleDeleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Loan CRUD handlers
  const handleAddLoan = (
    newLoanData: Omit<MemberLoanRecord, 'id' | 'monthlyInstallment' | 'remainingBalance'>
  ) => {
    const tempP: LoanParams = {
      nominal: newLoanData.principal,
      annualRate: newLoanData.annualRate,
      tenorMonths: newLoanData.tenorMonths,
      method: newLoanData.method,
      startMonth: 0,
      startYear: 2026,
      paymentTiming: 'SETIAP AKHIR BULAN',
      lenderName: '',
      lenderIdentity: '',
      lenderAddress: '',
      borrowerName: newLoanData.memberName,
      borrowerTitle: '',
      borrowerOrganization: '',
      signCity: '',
      signDateDay: '',
      signDateMonth: '',
      signDateYear: 2026,
      fees: [],
    };
    const calc = calculateLoan(tempP);
    const newLoan: MemberLoanRecord = {
      ...newLoanData,
      id: `loan-${Date.now()}`,
      monthlyInstallment: calc.firstMonthInstallment || calc.monthlyInstallment,
      remainingBalance: newLoanData.principal,
    };
    setMemberLoans((prev) => [newLoan, ...prev]);
  };

  const handleUpdateLoan = (updated: MemberLoanRecord) => {
    setMemberLoans((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleDeleteLoan = (id: string) => {
    setMemberLoans((prev) => prev.filter((l) => l.id !== id));
  };

  // Switch to simulation view loaded with a specific member loan
  const handleLoadLoanIntoSimulation = (loan: MemberLoanRecord) => {
    const parsedDate = new Date(loan.startDate);
    const month = isNaN(parsedDate.getMonth()) ? 8 : parsedDate.getMonth();
    const year = isNaN(parsedDate.getFullYear()) ? 2026 : parsedDate.getFullYear();

    setParams({
      ...params,
      nominal: loan.principal,
      annualRate: loan.annualRate,
      tenorMonths: loan.tenorMonths,
      method: loan.method,
      startMonth: month,
      startYear: year,
      borrowerName: loan.memberName,
    });
    setActiveTab('CALCULATOR');
    setIsSidebarOpen(false);
  };

  const handleSelectMemberForLoan = (member: MemberRecord) => {
    setParams({
      ...params,
      borrowerName: member.name,
      borrowerOrganization: `Koperasi Konsumen (${member.memberNo})`,
    });
    setActiveTab('LOANS');
    setIsSidebarOpen(false);
  };

  const navMenuItems = [
    {
      id: 'CALCULATOR' as const,
      label: 'Simulasi & Dokumen',
      description: 'Kalkulator bunga & tabel jadwal cetak resmi',
      icon: Calculator,
      badge: 'Utama',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'MEMBERS' as const,
      label: 'Pencatatan Anggota',
      description: 'Master data anggota & data identitas NIK',
      icon: Users,
      badge: `${members.length}`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'LOANS' as const,
      label: 'Pencatatan Pinjaman',
      description: 'Register plafon & akad pinjaman anggota',
      icon: DollarSign,
      badge: `${memberLoans.length}`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'FLOWCHART' as const,
      label: 'Flowchart PMK',
      description: 'Alur perjanjian kerjasama & pencairan modal',
      icon: GitBranch,
      badge: 'SOP',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'INTEREST_CALC' as const,
      label: 'Hitung Bunga Harian',
      description: 'Hitung prorata denda atau pelunasan harian/bulanan',
      icon: Clock,
      badge: 'Bunga',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      id: 'ALL' as const,
      label: 'Semua Modul',
      description: 'Tampilan terintegrasi satu layar',
      icon: Layers,
      badge: 'Full',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'CALCULATOR':
        return 'Simulasi Bunga & Dokumen Cetak Resmi';
      case 'MEMBERS':
        return 'Pencatatan Data Anggota Koperasi';
      case 'LOANS':
        return 'Pencatatan Akad Pinjaman Anggota';
      case 'FLOWCHART':
        return 'Flowchart Alur Kerjasama PMK (Pemberi - Penerima)';
      case 'INTEREST_CALC':
        return 'Kalkulator Bunga Harian & Bulanan';
      case 'ALL':
        return 'Semua Modul Terintegrasi';
      default:
        return 'Sistem Manajemen Pinjaman Koperasi';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden no-print"
        />
      )}

      {/* Modern Fixed/Sticky Sidebar Navigation */}
      <aside
        className={`group/sidebar no-print fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isSidebarOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full lg:translate-x-0 lg:w-[88px] lg:hover:w-72'
        }`}
      >
        {/* Sidebar Header Brand */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200 shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div className="min-w-0 transition-opacity duration-300 lg:opacity-0 lg:group-hover/sidebar:opacity-100">
                <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight truncate w-40">
                  Koperasi Simpan Pinjam
                </h1>
                <p className="text-[11px] font-semibold text-indigo-600 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600 inline" />
                  <span>Sistem PMK & Pinjaman</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu Links */}
          <div className="p-3.5 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 transition-opacity duration-300 lg:opacity-0 lg:group-hover/sidebar:opacity-100 whitespace-nowrap">
              Menu Utama
            </div>

            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  title={item.label}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all group/item ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-indigo-600 group-hover/item:bg-white group-hover/item:shadow-xs'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 transition-opacity duration-300 lg:opacity-0 lg:group-hover/sidebar:opacity-100">
                      <div className="font-bold text-xs truncate w-32">{item.label}</div>
                      <div
                        className={`text-[10px] truncate w-32 ${
                          isActive ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 transition-opacity duration-300 lg:opacity-0 lg:group-hover/sidebar:opacity-100 ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border border-indigo-100/70 transition-opacity duration-300 lg:opacity-0 lg:group-hover/sidebar:opacity-100">
            <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-xs whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate w-40">Koperasi Konsumen Karyawan</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed w-40">
              PT. Transportasi Jakarta &bull; Mitra Pendanaan Modal Kerja PMK
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium transition-opacity duration-300 lg:opacity-0 lg:group-hover/sidebar:opacity-100 whitespace-nowrap">
            <span>Versi Aplikasi 2.4</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Aktif
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area Container */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navbar Header */}
        <header className="no-print bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                title="Buka Menu Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>Modul</span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-indigo-600 font-bold">
                    {navMenuItems.find((n) => n.id === activeTab)?.label}
                  </span>
                </div>
                <h2 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate">
                  {getPageTitle()}
                </h2>
              </div>
            </div>

            {/* Quick Status / Header Stats */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400">Total Anggota:</span>
                <span className="font-extrabold text-slate-900">{members.length}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-400">Pinjaman:</span>
                <span className="font-extrabold text-indigo-600">{memberLoans.length}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace Bento Layout */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-7xl w-full">
          {/* Module 1: Pencatatan Data Anggota */}
          {(activeTab === 'MEMBERS' || activeTab === 'ALL') && (
            <div className="space-y-6">
              <MemberManager
                members={members}
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
                onSelectMemberForLoan={handleSelectMemberForLoan}
              />
            </div>
          )}

          {/* Module 2: Pencatatan Pinjaman */}
          {(activeTab === 'LOANS' || activeTab === 'ALL') && (
            <div className="space-y-6">
              <MemberLoanManager
                loans={memberLoans}
                members={members}
                onAddLoan={handleAddLoan}
                onUpdateLoan={handleUpdateLoan}
                onDeleteLoan={handleDeleteLoan}
                onLoadIntoSimulation={handleLoadLoanIntoSimulation}
              />
            </div>
          )}

          {/* Module 3: Flowchart Tab View */}
          {(activeTab === 'FLOWCHART' || activeTab === 'ALL') && (
            <div className="space-y-6">
              <WorkflowFlowchart />
            </div>
          )}

          {/* Module: Kalkulator Bunga Harian/Bulanan */}
          {(activeTab === 'INTEREST_CALC' || activeTab === 'ALL') && (
            <div className="space-y-6">
              <DailyMonthlyInterest />
            </div>
          )}

          {/* Module 4: Calculator & Official Document Table View */}
          {(activeTab === 'CALCULATOR' || activeTab === 'ALL') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Parameters Bento Form (Col span 4) */}
              <div className="no-print lg:col-span-4 space-y-6">
                <LoanForm params={params} onChange={setParams} onReset={handleReset} />
              </div>

              {/* Right Column: Dashboard & Official Printable Schedule (Col span 8) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Bento KPI Summary Dashboard */}
                <div className="no-print">
                  <StatsDashboard
                    params={params}
                    result={calculationResult}
                  />
                </div>

                {/* The Official Document Schedule Table in Bento Enclosure */}
                <div>
                  <OfficialTableDocument
                    params={params}
                    result={calculationResult}
                    onParamsChange={setParams}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


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
  Search,
  Bell,
  Info,
  Moon,
  Sun,
  Plus,
  Lock,
  MinusSquare,
  LayoutDashboard
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
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode class on document element
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
        return 'CopyRight 2026 @Yudiana';
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

  const sidebarOpacityClass = isSidebarPinned ? 'opacity-100' : 'lg:opacity-0 lg:group-hover/sidebar:opacity-100';

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-[#0B1437] transition-colors duration-300 text-slate-900 dark:text-white flex font-sans antialiased">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-[#0B1437]/50 backdrop-blur-xs z-40 lg:hidden no-print"
        />
      )}

      {/* Modern Fixed/Sticky Sidebar Navigation */}
      <aside
        className={`group/sidebar no-print fixed lg:sticky top-0 left-0 h-screen bg-[#101828] border-none z-50 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-hidden shadow-sm ${
          isSidebarOpen
            ? 'translate-x-0 w-[280px]'
            : `-translate-x-full lg:translate-x-0 ${isSidebarPinned ? 'lg:w-[280px]' : 'lg:w-[80px] lg:hover:w-[280px]'}`
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="flex flex-col h-full">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:pl-1">
              <div className="w-3 h-3 rounded-full bg-white shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
              <div className={`min-w-0 transition-opacity duration-300 ${sidebarOpacityClass}`}>
                <h1 className="font-semibold text-white text-base tracking-tight truncate w-40">
                  Dashbord Finance
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                } else {
                  setIsSidebarPinned(!isSidebarPinned);
                }
              }}
              className={`p-1 rounded-md transition-colors shrink-0 ${isSidebarPinned ? 'text-white bg-[#1D2939]' : 'text-[#98A2B3] hover:text-white hover:bg-[#1D2939]'}`}
              title="Toggle sidebar pin"
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu Links (Top Section) */}
          <div className="px-3 pt-4 pb-2 space-y-1">
            {navMenuItems.slice(0, 3).map((item) => {
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors duration-200 group/item relative ${
                    isActive
                      ? 'bg-[#1D2939] text-white'
                      : 'text-[#CECFD2] hover:bg-[#1D2939] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                    <div className={`min-w-0 transition-opacity duration-300 ${sidebarOpacityClass}`}>
                      <div className="font-medium text-sm truncate w-32">
                        {item.label}
                      </div>
                    </div>
                  </div>
                  
                  {item.badge && (
                    <span className={`transition-opacity duration-300 ${sidebarOpacityClass} bg-[#344054] text-[#EAECF0] text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation Menu Links (Secondary/Projects Section) */}
          <div className={`px-3 pt-6 pb-2 space-y-1 transition-opacity duration-300 ${sidebarOpacityClass}`}>
            <div className="flex items-center justify-between px-3 mb-3">
              <span className="text-xs font-semibold text-[#98A2B3]">Projects</span>
              <button className="text-[#98A2B3] hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {navMenuItems.slice(3).map((item, idx) => {
              const isActive = activeTab === item.id;
              const dotColors = ['bg-[#9E77ED]', 'bg-[#1570EF]', 'bg-[#12B76A]', 'bg-[#F04438]', 'bg-white'];
              const dotColor = dotColors[idx % dotColors.length];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  title={item.label}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors duration-200 group/item relative ${
                    isActive
                      ? 'bg-[#1D2939] text-white'
                      : 'text-[#CECFD2] hover:bg-[#1D2939] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                    </div>
                    <div className={`min-w-0 transition-opacity duration-300 ${sidebarOpacityClass}`}>
                      <div className="font-medium text-sm truncate w-32">
                        {item.label}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <ChevronRight className={`w-4 h-4 text-[#98A2B3] transition-opacity duration-300 ${sidebarOpacityClass}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Spacer to push footer to bottom */}
          <div className="flex-1"></div>

          {/* Theme Toggle Footer */}
          <div className={`p-4 transition-opacity duration-300 ${sidebarOpacityClass}`}>
            <div className="flex items-center bg-[#0C111D] p-1 rounded-lg border border-[#1D2939]">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-colors ${
                  !isDarkMode ? 'bg-[#1D2939] text-white shadow-sm' : 'text-[#98A2B3] hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-colors ${
                  isDarkMode ? 'bg-[#1D2939] text-white shadow-sm' : 'text-[#98A2B3] hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area Container */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navbar Header */}
        <header className="no-print sticky top-0 z-30 pt-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <div className="text-[#A3AED0] text-sm font-medium mb-1 transition-colors duration-300">
                Pages / {navMenuItems.find((n) => n.id === activeTab)?.label}
              </div>
              <h2 className="font-bold text-[#2B3674] dark:text-white text-3xl tracking-tight truncate transition-colors duration-300">
                {getPageTitle()}
              </h2>
            </div>

            {/* Right Action Bar (Search & Profile) */}
            <div className="flex items-center gap-4 bg-white dark:bg-[#111C44] rounded-full p-2.5 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
              {/* Search Bar */}
              <div className="flex items-center bg-[#F4F7FE] dark:bg-[#0B1437] rounded-full px-4 py-2 w-full sm:w-56 transition-colors duration-300">
                <Search className="w-4 h-4 text-[#2B3674] dark:text-white transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm ml-2 w-full text-[#2B3674] dark:text-white placeholder-[#8F9BBA] dark:placeholder-slate-400"
                />
              </div>

              {/* Action Icons */}
              <button className="text-[#A3AED0] hover:text-[#2B3674] dark:hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              <button className="text-[#A3AED0] hover:text-[#2B3674] dark:hover:text-white transition-colors">
                <Info className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="text-[#A3AED0] hover:text-[#2B3674] dark:hover:text-white transition-colors"
                title="Toggle Dark Mode"
              >
                <Moon className="w-5 h-5" />
              </button>

              {/* Profile Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#11047A] flex items-center justify-center text-white font-bold text-sm ml-1 cursor-pointer overflow-hidden border-2 border-white dark:border-[#111C44] shadow-sm transition-colors duration-300">
                <img src="https://ui-avatars.com/api/?name=Alex+Sterling&background=random" alt="Profile" className="w-full h-full object-cover" />
              </div>

              {/* Mobile Sidebar Toggle (only visible on small screens inside this block) */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-full text-[#A3AED0] hover:text-[#2B3674] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300"
                title="Buka Menu Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
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
              {/* Left Column: Interactive Simulation Bento Form (Col span 4) */}
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


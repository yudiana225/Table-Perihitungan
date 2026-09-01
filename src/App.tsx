import React, { useState, useMemo } from 'react';
import { LoanParams, LoanFee } from './types';
import { calculateLoan } from './utils/calculator';
import { LoanForm } from './components/LoanForm';
import { OfficialTableDocument } from './components/OfficialTableDocument';
import { StatsDashboard } from './components/StatsDashboard';

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

  const calculationResult = useMemo(() => {
    return calculateLoan(params);
  }, [params]);

  const handleReset = () => {
    setParams(EMPTY_PARAMS);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Bento Grid Header */}
      <header className="no-print border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
              %
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                Tabel Perhitungan Bunga Pinjaman
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Bento Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>

      {/* Footer */}
    </div>
  );
}

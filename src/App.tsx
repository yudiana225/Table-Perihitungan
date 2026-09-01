import React, { useState, useMemo } from 'react';
import { LoanParams } from './types';
import { calculateLoan } from './utils/calculator';
import { LoanForm } from './components/LoanForm';
import { OfficialTableDocument } from './components/OfficialTableDocument';
import { StatsDashboard } from './components/StatsDashboard';
import { PWAInstallBanner } from './components/PWAInstallBanner';

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
};

export default function App() {
  const [params, setParams] = useState<LoanParams>(DEFAULT_PARAMS);

  const calculationResult = useMemo(() => {
    return calculateLoan(params);
  }, [params]);

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
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
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                  Tabel Perhitungan Bunga Pinjaman
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Bento Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Kalkulator simulasi pinjaman, jadwal amortisasi resmi & ekspor dokumen siap cetak
              </p>
            </div>
          </div>

          {/* PWA Install & Offline Status */}
          <div className="flex items-center gap-3">
            <PWAInstallBanner />
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
      <footer className="no-print bg-white border-t border-slate-200/80 mt-auto py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Tabel Perhitungan Bunga Pinjaman</span>
            <span>—</span>
            <span>Standar Finansial Koperasi & Perbankan Indonesia</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Amortisasi Flat, Efektif & Anuitas</span>
            <span>•</span>
            <span>Ekspor Excel & Cetak PDF</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

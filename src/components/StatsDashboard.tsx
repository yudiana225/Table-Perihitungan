import React from 'react';
import { LoanParams, LoanCalculationResult } from '../types';
import { formatRupiah, formatPercent } from '../utils/calculator';
import { TrendingUp, CreditCard, ShieldCheck, Wallet, Receipt } from 'lucide-react';

interface StatsDashboardProps {
  params: LoanParams;
  result: LoanCalculationResult;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ params, result }) => {
  const interestRatio = (result.totalInterest / (params.nominal || 1)) * 100;
  const principalPercentage = (result.totalPrincipal / (result.totalPayment || 1)) * 100;
  const interestPercentage = (result.totalInterest / (result.totalPayment || 1)) * 100;

  // Sample monthly distribution (first 6 months or proportional) for visual bar chart
  const sampleRows = result.rows.slice(0, Math.min(6, result.rows.length));

  return (
    <div id="stats-dashboard" className="space-y-6">
      {/* Bento Grid: Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cicilan Per Bulan */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Cicilan Per Bulan</p>
              <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                {params.method === 'FLAT' || params.method === 'ANUITAS'
                  ? formatRupiah(result.monthlyInstallment)
                  : `${formatRupiah(result.firstMonthInstallment)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Metode: <strong className="text-slate-800">{params.method}</strong></span>
            <span className="text-emerald-700 font-semibold">{params.tenorMonths}x</span>
          </div>
        </div>

        {/* Card 2: Total Bunga */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Bunga ({params.annualRate}%)</p>
              <p className="text-xl font-extrabold text-amber-700 tracking-tight">
                {formatRupiah(result.totalInterest)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Porsi: <strong className="text-amber-800">{formatPercent(interestRatio, 1)}</strong></span>
            <span className="text-slate-600 font-mono">{(params.annualRate / 12).toFixed(2)}%/bln</span>
          </div>
        </div>

        {/* Card 3: Pencairan Bersih Diterima */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Pencairan Bersih</p>
              <p className="text-xl font-extrabold text-teal-700 tracking-tight">
                {formatRupiah(result.netDisbursement)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Potongan Biaya:</span>
            <span className="text-rose-600 font-bold">{formatRupiah(result.totalFees)}</span>
          </div>
        </div>

        {/* Card 4: Total Pengembalian */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Pembayaran</p>
              <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                {formatRupiah(result.totalPayment)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Pokok + Bunga</span>
            <span className="text-indigo-600 font-bold">{params.tenorMonths} Bln Lunas</span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Visual Composition & Financial Breakdown Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Komposisi Pembayaran</h3>
            <p className="text-sm font-bold text-slate-800 mt-0.5">Perbandingan Porsi Pokok & Bunga Pinjaman</p>
          </div>
        </div>

        {/* Visual Mini Bars (Bento Style) */}
        {sampleRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-2 h-24 pt-4 px-2 bg-slate-50/70 rounded-2xl border border-slate-100">
              {sampleRows.map((r) => {
                const maxTotal = Math.max(...sampleRows.map((x) => x.total));
                const principalHeight = (r.principal / maxTotal) * 100;
                const interestHeight = (r.interest / maxTotal) * 100;

                return (
                  <div key={r.no} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                    <div className="w-full max-w-[36px] flex items-end gap-0.5 h-full">
                      <div
                        className="flex-1 bg-indigo-600 rounded-t-md transition-all duration-300 group-hover:bg-indigo-700"
                        style={{ height: `${principalHeight}%` }}
                        title={`Pokok: ${formatRupiah(r.principal)}`}
                      />
                      <div
                        className="flex-1 bg-amber-400 rounded-t-md transition-all duration-300 group-hover:bg-amber-500"
                        style={{ height: `${interestHeight}%` }}
                        title={`Bunga: ${formatRupiah(r.interest)}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Bln {r.no}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress Bar Proportion */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${principalPercentage}%` }}
              title={`Pokok: ${formatRupiah(result.totalPrincipal)}`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${interestPercentage}%` }}
              title={`Bunga: ${formatRupiah(result.totalInterest)}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                <span className="text-slate-600 font-medium">
                  Pokok: <strong className="text-slate-900">{formatPercent(principalPercentage, 1)}</strong> ({formatRupiah(result.totalPrincipal)})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-amber-400 rounded-full" />
                <span className="text-amber-800 font-medium">
                  Bunga: <strong className="text-amber-900">{formatPercent(interestPercentage, 1)}</strong> ({formatRupiah(result.totalInterest)})
                </span>
              </div>
            </div>
            <span className="text-slate-400 hidden sm:inline text-[11px]">
              Tenor {params.tenorMonths} Bulan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


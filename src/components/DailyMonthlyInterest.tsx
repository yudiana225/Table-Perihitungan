import React, { useState, useMemo } from 'react';
import { Calculator, Calendar, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { formatRupiah } from '../utils/calculator';

export const DailyMonthlyInterest: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(10000000);
  const [rate, setRate] = useState<number>(12);
  const [rateType, setRateType] = useState<'YEAR' | 'MONTH'>('YEAR');
  const [daysInYear, setDaysInYear] = useState<360 | 365>(365);
  
  // Custom period calculation
  const [calcPeriodType, setCalcPeriodType] = useState<'DAYS' | 'MONTHS'>('DAYS');
  const [calcPeriodValue, setCalcPeriodValue] = useState<number>(15);

  const analysis = useMemo(() => {
    const annualRate = rateType === 'YEAR' ? rate : rate * 12;
    const annualInterest = principal * (annualRate / 100);
    const monthlyInterest = annualInterest / 12;
    const dailyInterest = annualInterest / daysInYear;

    let customPeriodInterest = 0;
    if (calcPeriodType === 'DAYS') {
      customPeriodInterest = dailyInterest * calcPeriodValue;
    } else {
      customPeriodInterest = monthlyInterest * calcPeriodValue;
    }

    return {
      annualRate,
      annualInterest,
      monthlyInterest,
      dailyInterest,
      customPeriodInterest,
      totalPayment: principal + customPeriodInterest,
    };
  }, [principal, rate, rateType, daysInYear, calcPeriodType, calcPeriodValue]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/50">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
              Kalkulator Bunga Harian & Bulanan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hitung prorata bunga berjalan untuk pelunasan dipercepat, denda keterlambatan, atau pinjaman jangka pendek.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column: Inputs */}
        <div className="space-y-5">
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              Parameter Dasar
            </h3>
            
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1.5">
                Plafon Pokok (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="100000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1.5">
                  Suku Bunga (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1.5">
                  Tipe Suku Bunga
                </label>
                <select
                  value={rateType}
                  onChange={(e) => setRateType(e.target.value as 'YEAR' | 'MONTH')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="YEAR">Per Tahun (p.a)</option>
                  <option value="MONTH">Per Bulan (p.m)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1.5">
                Basis Hari Per Tahun (Basis Perhitungan Harian)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDaysInYear(360)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                    daysInYear === 360
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  360 Hari (Standar Bank)
                </button>
                <button
                  type="button"
                  onClick={() => setDaysInYear(365)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                    daysInYear === 365
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  365 Hari (Aktual)
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100/60">
            <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Hitung Untuk Jangka Waktu Spesifik
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-indigo-900 text-xs block mb-1.5">
                  Durasi Jangka Waktu
                </label>
                <input
                  type="number"
                  min="1"
                  value={calcPeriodValue}
                  onChange={(e) => setCalcPeriodValue(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 font-extrabold text-indigo-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-indigo-900 text-xs block mb-1.5">
                  Satuan Waktu
                </label>
                <select
                  value={calcPeriodType}
                  onChange={(e) => setCalcPeriodType(e.target.value as 'DAYS' | 'MONTHS')}
                  className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 font-bold text-indigo-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="DAYS">Hari</option>
                  <option value="MONTHS">Bulan</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Bunga Per Tahun</span>
              <span className="text-lg font-extrabold text-slate-900 block mt-1">
                {formatRupiah(analysis.annualInterest)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Suku Bunga Efektif: {analysis.annualRate}% / thn
              </span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Bunga Per Bulan</span>
              <span className="text-lg font-extrabold text-slate-900 block mt-1">
                {formatRupiah(analysis.monthlyInterest)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Pembagian rata-rata per bulan
              </span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-xs sm:col-span-2">
              <span className="text-xs font-semibold text-slate-500 block">Bunga Per Hari (Basis {daysInYear})</span>
              <span className="text-xl font-extrabold text-indigo-600 block mt-1">
                {formatRupiah(analysis.dailyInterest)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Prorata harian untuk denda / penyelesaian awal
              </span>
            </div>
          </div>

          <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Hasil Perhitungan Spesifik
              </h3>
              <div className="mt-1 text-sm font-medium text-slate-300">
                Untuk jangka waktu <strong className="text-white">{calcPeriodValue} {calcPeriodType === 'DAYS' ? 'Hari' : 'Bulan'}</strong>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                  <span className="text-sm font-semibold text-slate-300">Total Bunga Berjalan</span>
                  <span className="text-lg font-bold text-emerald-400">
                    + {formatRupiah(analysis.customPeriodInterest)}
                  </span>
                </div>
                
                <div className="flex items-end justify-between pt-1">
                  <span className="text-sm font-semibold text-slate-300 mb-1">Total (Pokok + Bunga)</span>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-white block">
                      {formatRupiah(analysis.totalPayment)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

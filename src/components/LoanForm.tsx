import React, { useState, useMemo, useEffect } from 'react';
import { LoanParams, InterestMethod } from '../types';
import {
  INDONESIAN_MONTHS,
  formatRupiah,
  formatPercent,
  formatNumberIndo,
  getInterestSummary,
  calculateAnnualRateFromInstallment,
} from '../utils/calculator';
import { LoanFeesManager } from './LoanFeesManager';
import {
  Calculator,
  Calendar,
  Percent,
  Coins,
  Building,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  CreditCard,
  Sparkles,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';

interface LoanFormProps {
  params: LoanParams;
  onChange: (params: LoanParams) => void;
  onReset: () => void;
}

const NOMINAL_PRESETS = [
  { label: '10 Jt', value: 10_000_000 },
  { label: '25 Jt', value: 25_000_000 },
  { label: '50 Jt', value: 50_000_000 },
  { label: '100 Jt', value: 100_000_000 },
  { label: '250 Jt', value: 250_000_000 },
  { label: '500 Jt', value: 500_000_000 },
];

const TENOR_PRESETS = [6, 12, 18, 24, 36, 48, 60];

export const LoanForm: React.FC<LoanFormProps> = ({ params, onChange, onReset }) => {
  const [showPartyDetails, setShowPartyDetails] = useState(false);
  const [rateInputMode, setRateInputMode] = useState<'YEAR' | 'MONTH'>('YEAR');

  const updateParam = <K extends keyof LoanParams>(key: K, value: LoanParams[K]) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  const monthlyRate = params.annualRate / 12;

  // Live calculation of installment and interest summary
  const interestSummary = useMemo(() => {
    return getInterestSummary(params.nominal, params.annualRate, params.tenorMonths, params.method);
  }, [params.nominal, params.annualRate, params.tenorMonths, params.method]);

  // Installment parameter local state
  const [installmentInput, setInstallmentInput] = useState<number>(interestSummary.monthlyInstallment || 0);
  const [isTypingInstallment, setIsTypingInstallment] = useState<boolean>(false);

  useEffect(() => {
    if (!isTypingInstallment) {
      setInstallmentInput(interestSummary.monthlyInstallment);
    }
  }, [interestSummary.monthlyInstallment, isTypingInstallment]);

  // Derive the displayed rate value based on the selected mode
  const displayedRate = rateInputMode === 'YEAR' ? params.annualRate : Number(monthlyRate.toFixed(4));

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTypingInstallment(false);
    const value = Math.max(0, Number(e.target.value));
    const newAnnualRate = rateInputMode === 'YEAR' ? value : value * 12;
    updateParam('annualRate', newAnnualRate);
  };

  const handleInstallmentChange = (value: number) => {
    setIsTypingInstallment(true);
    setInstallmentInput(value);
    if (params.nominal > 0 && params.tenorMonths > 0) {
      const calculatedRate = calculateAnnualRateFromInstallment(
        params.nominal,
        params.tenorMonths,
        value,
        params.method
      );
      updateParam('annualRate', calculatedRate);
    }
  };

  const handleAdjustInstallment = (delta: number) => {
    setIsTypingInstallment(false);
    const current = interestSummary.monthlyInstallment || 0;
    const nextVal = Math.max(interestSummary.minInstallment, current + delta);
    handleInstallmentChange(nextVal);
  };

  const handleRoundInstallment = () => {
    setIsTypingInstallment(false);
    const current = interestSummary.monthlyInstallment || 0;
    const roundUnit = current > 5000000 ? 100000 : 50000;
    const rounded = Math.round(current / roundUnit) * roundUnit;
    const finalVal = Math.max(interestSummary.minInstallment, rounded);
    handleInstallmentChange(finalVal);
  };

  // Smart Installment Target Presets based on nominal and tenor
  const smartInstallmentPresets = useMemo(() => {
    if (interestSummary.minInstallment <= 0) return [];
    const min = interestSummary.minInstallment;
    const step = min < 1000000 ? 50000 : min < 5000000 ? 250000 : min < 20000000 ? 500000 : 1000000;
    const p1 = Math.ceil(min / step) * step;
    const p2 = p1 + step;
    const p3 = p1 + step * 2;
    const p4 = p1 + step * 4;
    return Array.from(new Set([p1, p2, p3, p4])).filter((v) => v > 0);
  }, [interestSummary.minInstallment]);

  return (
    <div id="loan-form-container" className="space-y-4">
      {/* Bento Main Control Card (Deep Indigo Hero) */}
      <div className="bg-[#4318FF] rounded-3xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
        {/* Background ambient pattern */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Simulasi Rate</h2>
                <p className="text-xs text-indigo-200">Atur nominal, angka cicilan & bunga</p>
              </div>
            </div>
            <button
              id="btn-reset-params"
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-indigo-200 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Reset ke nilai default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-5">
            {/* Input 1: Jumlah Pinjaman */}
            <div className="group">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-nominal" className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
                  Jumlah Pinjaman (Pokok)
                </label>
                <span className="text-xs font-bold text-amber-300">
                  {formatRupiah(params.nominal)}
                </span>
              </div>
              <div className="relative border-b border-indigo-400 focus-within:border-white transition-colors pb-1">
                <span className="text-lg font-bold text-indigo-300 mr-2">Rp</span>
                <input
                  id="input-nominal"
                  type="number"
                  min="100000"
                  step="1000000"
                  value={params.nominal || ''}
                  onChange={(e) => updateParam('nominal', Math.max(0, Number(e.target.value)))}
                  className="bg-transparent text-2xl font-extrabold text-white w-full focus:outline-none placeholder-indigo-300/50"
                  placeholder="100000000"
                />
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {NOMINAL_PRESETS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateParam('nominal', item.value)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      params.nominal === item.value
                        ? 'bg-white text-indigo-700 font-bold shadow-xs'
                        : 'bg-indigo-700/60 text-indigo-100 hover:bg-indigo-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Tenor & Metode Bunga */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Tenor */}
              <div className="group">
                <label htmlFor="input-tenor" className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1 block">
                  Tenor (Jangka Waktu)
                </label>
                <div className="border-b border-indigo-400 focus-within:border-white transition-colors pb-1 flex items-baseline">
                  <input
                    id="input-tenor"
                    type="number"
                    min="1"
                    max="360"
                    value={params.tenorMonths || ''}
                    onChange={(e) => updateParam('tenorMonths', Math.max(0, parseInt(e.target.value) || 0))}
                    className="bg-transparent text-2xl font-extrabold text-white w-full focus:outline-none placeholder-indigo-300/50"
                    placeholder="12"
                  />
                  <span className="text-xs font-bold text-indigo-200 ml-1">Bulan</span>
                </div>

                {/* Tenor Quick Chips */}
                <div className="flex flex-wrap gap-1 pt-2">
                  {TENOR_PRESETS.slice(0, 5).map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => updateParam('tenorMonths', months)}
                      className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-all ${
                        params.tenorMonths === months
                          ? 'bg-white text-indigo-700 font-bold shadow-xs'
                          : 'bg-indigo-700/60 text-indigo-100 hover:bg-indigo-700'
                      }`}
                    >
                      {months} Bln
                    </button>
                  ))}
                </div>
              </div>

              {/* Metode Perhitungan Bunga */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
                  Metode Bunga
                </label>
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {(['FLAT', 'EFEKTIF', 'ANUITAS'] as InterestMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      id={`method-btn-${method}`}
                      onClick={() => updateParam('method', method)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold text-center transition-all ${
                        params.method === method
                          ? 'bg-white text-indigo-900 shadow-md ring-2 ring-amber-400'
                          : 'bg-indigo-700/60 text-indigo-100 hover:bg-indigo-700'
                      }`}
                    >
                      {method === 'FLAT' ? 'Flat' : method === 'EFEKTIF' ? 'Efektif' : 'Anuitas'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-indigo-200/80 pt-1">
                  {params.method === 'FLAT'
                    ? 'Bunga flat tetap per bulan'
                    : params.method === 'EFEKTIF'
                    ? 'Bunga menurun atas sisa pokok'
                    : 'Cicilan bulanan tetap (anuitas)'}
                </p>
              </div>
            </div>

            {/* Parameter Angka Cicilan & Bunga Section */}
            <div className="space-y-4 pt-2">
              {/* Parameter Baru: Angka Cicilan (Per Bulan) */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all shadow-inner">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    <label htmlFor="input-angka-cicilan" className="text-xs font-bold text-amber-200 uppercase tracking-wider block">
                      Parameter Angka Cicilan (Per Bulan)
                    </label>
                  </div>
                  <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-lg border border-amber-300/30 shadow-xs">
                    {formatRupiah(interestSummary.monthlyInstallment)}/bln
                  </span>
                </div>

                <div className="relative border-b-2 border-amber-300/60 focus-within:border-amber-300 transition-colors pb-1 flex items-baseline">
                  <span className="text-lg font-bold text-amber-200 mr-2">Rp</span>
                  <input
                    id="input-angka-cicilan"
                    type="number"
                    min="0"
                    step="50000"
                    value={installmentInput || ''}
                    onChange={(e) => handleInstallmentChange(Number(e.target.value))}
                    onBlur={() => {
                      setIsTypingInstallment(false);
                      setInstallmentInput(interestSummary.monthlyInstallment);
                    }}
                    className="bg-transparent text-2xl font-black text-white w-full focus:outline-none placeholder-indigo-200/40"
                    placeholder={String(interestSummary.monthlyInstallment || 0)}
                  />
                </div>

                {/* Quick adjustments for Angka Cicilan */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 text-[11px]">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustInstallment(-100000)}
                      className="px-2 py-0.5 rounded-md bg-white/15 text-indigo-100 hover:bg-white/25 transition-colors font-medium"
                      title="Kurangi cicilan Rp 100.000"
                    >
                      -100 Rb
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustInstallment(100000)}
                      className="px-2 py-0.5 rounded-md bg-white/15 text-indigo-100 hover:bg-white/25 transition-colors font-medium"
                      title="Tambah cicilan Rp 100.000"
                    >
                      +100 Rb
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustInstallment(500000)}
                      className="px-2 py-0.5 rounded-md bg-white/15 text-indigo-100 hover:bg-white/25 transition-colors font-medium"
                      title="Tambah cicilan Rp 500.000"
                    >
                      +500 Rb
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRoundInstallment}
                    className="px-2 py-0.5 rounded-md bg-amber-400/25 text-amber-200 hover:bg-amber-400/40 font-semibold transition-colors border border-amber-400/30"
                    title="Bulatkan cicilan ke ratusan ribu terdekat"
                  >
                    Bulatkan Cicilan
                  </button>
                </div>

                {/* Smart Target Cicilan Presets */}
                {smartInstallmentPresets.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/10 mt-2">
                    <span className="text-[10px] text-indigo-200 font-medium">Pilihan Target:</span>
                    {smartInstallmentPresets.map((presetVal) => (
                      <button
                        key={presetVal}
                        type="button"
                        onClick={() => handleInstallmentChange(presetVal)}
                        className={`text-[11px] px-2 py-0.5 rounded-md transition-all font-semibold ${
                          Math.abs(interestSummary.monthlyInstallment - presetVal) < 1000
                            ? 'bg-amber-400 text-slate-900 font-bold shadow-xs'
                            : 'bg-white/15 text-indigo-100 hover:bg-white/25'
                        }`}
                      >
                        {formatRupiah(presetVal)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Minimum principal warning */}
                {interestSummary.minInstallment > 0 &&
                  installmentInput > 0 &&
                  installmentInput < interestSummary.minInstallment && (
                    <p className="text-[11px] text-amber-200 bg-amber-500/20 rounded-lg p-1.5 mt-2 border border-amber-300/30">
                      ⚠️ Cicilan minimum untuk pokok adalah {formatRupiah(interestSummary.minInstallment)}/bln. Bunga saat ini dihitung 0%.
                    </p>
                  )}
              </div>

              {/* Suku Bunga (%) Input */}
              <div className="group bg-indigo-900/40 rounded-2xl p-3.5 border border-indigo-400/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
                    <span className="text-indigo-200">Suku Bunga Pinjaman</span>
                    <button
                      type="button"
                      onClick={() => setRateInputMode((m) => (m === 'YEAR' ? 'MONTH' : 'YEAR'))}
                      className="px-1.5 py-0.5 rounded-md bg-indigo-500/40 text-white hover:bg-indigo-500/60 transition-colors ml-1 font-bold text-[10px]"
                      title="Klik untuk mengubah mode input bunga (Tahun/Bulan)"
                    >
                      (% / {rateInputMode === 'YEAR' ? 'THN' : 'BLN'})
                    </button>
                  </div>
                  <span className="text-xs font-bold text-amber-300">
                    {rateInputMode === 'YEAR'
                      ? `~${monthlyRate.toFixed(2)}%/bln`
                      : `~${params.annualRate.toFixed(2)}%/thn`}
                  </span>
                </div>
                <div className="border-b border-indigo-400 focus-within:border-white transition-colors pb-1 flex items-baseline">
                  <input
                    id="input-bunga"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={displayedRate !== undefined && !isNaN(displayedRate) ? displayedRate : ''}
                    onChange={handleRateChange}
                    className="bg-transparent text-xl font-extrabold text-white w-full focus:outline-none placeholder-indigo-300/50"
                    placeholder="14"
                  />
                  <span className="text-base font-bold text-indigo-200">%</span>
                </div>
              </div>

              {/* Otomatis Menampilkan Bunga (Live Real-Time Interest Card) */}
              <div
                id="panel-bunga-otomatis"
                className="bg-gradient-to-br from-[#1E1B4B]/90 via-[#2E1065]/90 to-[#1E1B4B]/90 rounded-2xl p-4 border border-amber-300/30 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                      Otomatis Menampilkan Bunga
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Otomatis Terhitung
                  </span>
                </div>

                {/* 2-Column KPI Bunga */}
                <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                  {/* Bunga per Bulan */}
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider block">
                      Bunga per Bulan
                    </span>
                    <span className="text-lg sm:text-xl font-black text-amber-300 tracking-tight block truncate mt-0.5">
                      {formatRupiah(interestSummary.monthlyInterest)}
                    </span>
                    <span className="text-[10px] text-indigo-200/90 font-medium mt-1">
                      {formatPercent(interestSummary.monthlyRate, 2)} / bulan
                    </span>
                  </div>

                  {/* Total Bunga Pinjaman */}
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider block">
                      Total Akumulasi Bunga
                    </span>
                    <span className="text-lg sm:text-xl font-black text-emerald-300 tracking-tight block truncate mt-0.5">
                      {formatRupiah(interestSummary.totalInterest)}
                    </span>
                    <span className="text-[10px] text-indigo-200/90 font-medium mt-1">
                      {formatPercent(interestSummary.annualRate, 2)} / tahun ({params.tenorMonths} bln)
                    </span>
                  </div>
                </div>

                {/* Komposisi Cicilan: Pokok vs Bunga */}
                <div className="pt-2 border-t border-white/10 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-100">
                    <span className="font-medium">Komposisi Cicilan:</span>
                    <span className="font-bold text-white">
                      Pokok {formatRupiah(interestSummary.principalPerMonth)} + Bunga {formatRupiah(interestSummary.monthlyInterest)}
                    </span>
                  </div>

                  {/* Visual Proportion Bar */}
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-indigo-300 h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (interestSummary.principalPerMonth / (interestSummary.monthlyInstallment || 1)) * 100
                          )
                        )}%`,
                      }}
                      title="Porsi Pokok"
                    />
                    <div
                      className="bg-amber-400 h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (interestSummary.monthlyInterest / (interestSummary.monthlyInstallment || 1)) * 100
                          )
                        )}%`,
                      }}
                      title="Porsi Bunga"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-indigo-200 pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-2 h-2 rounded-full bg-indigo-300 inline-block" />
                      Pokok:{' '}
                      {(
                        (interestSummary.principalPerMonth / (interestSummary.monthlyInstallment || 1)) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                    <span className="flex items-center gap-1 font-medium text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Bunga:{' '}
                      {(
                        (interestSummary.monthlyInterest / (interestSummary.monthlyInstallment || 1)) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Periode Mulai & Jadwal */}
        <div className="mt-6 pt-4 border-t border-indigo-500/80 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-indigo-200 block text-[10px] font-semibold uppercase">Mulai Angsuran</span>
            <select
              value={params.startMonth}
              onChange={(e) => updateParam('startMonth', parseInt(e.target.value))}
              className="mt-1 bg-indigo-700 text-white rounded-lg px-2 py-1.5 text-xs font-semibold w-full focus:outline-none focus:ring-1 focus:ring-white"
            >
              {INDONESIAN_MONTHS.map((month, idx) => (
                <option key={month} value={idx}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-indigo-200 block text-[10px] font-semibold uppercase">Tahun</span>
            <input
              type="number"
              value={params.startYear}
              onChange={(e) => updateParam('startYear', parseInt(e.target.value) || 2026)}
              className="mt-1 bg-indigo-700 text-white rounded-lg px-2 py-1.5 text-xs font-semibold w-full focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>
        </div>
      </div>

      {/* Bento Secondary Card: Dokumen & Penandatangan */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <button
          type="button"
          id="btn-toggle-party-details"
          onClick={() => setShowPartyDetails(!showPartyDetails)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            <span>Data Dokumen & Penandatangan Resmi</span>
          </span>
          {showPartyDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showPartyDetails && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="input-payment-timing" className="font-semibold text-slate-700">
                Jadwal Jatuh Tempo
              </label>
              <input
                id="input-payment-timing"
                type="text"
                value={params.paymentTiming}
                onChange={(e) => updateParam('paymentTiming', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                placeholder="SETIAP AKHIR BULAN"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="input-lender-name" className="font-semibold text-slate-700">
                  Lender / Pemberi Pinjaman
                </label>
                <input
                  id="input-lender-name"
                  type="text"
                  value={params.lenderName}
                  onChange={(e) => updateParam('lenderName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="input-lender-id" className="font-semibold text-slate-700">
                  Identitas Lender
                </label>
                <input
                  id="input-lender-id"
                  type="text"
                  value={params.lenderIdentity}
                  onChange={(e) => updateParam('lenderIdentity', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="input-lender-address" className="font-semibold text-slate-700">
                Alamat Lender
              </label>
              <input
                id="input-lender-address"
                type="text"
                value={params.lenderAddress}
                onChange={(e) => updateParam('lenderAddress', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                placeholder="Alamat lengkap"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label htmlFor="input-borrower-name" className="font-semibold text-slate-700">
                  Penerima Dana
                </label>
                <input
                  id="input-borrower-name"
                  type="text"
                  value={params.borrowerName}
                  onChange={(e) => updateParam('borrowerName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  placeholder="Arkadeus Hamudin"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="input-borrower-title" className="font-semibold text-slate-700">
                  Jabatan Penerima
                </label>
                <input
                  id="input-borrower-title"
                  type="text"
                  value={params.borrowerTitle}
                  onChange={(e) => updateParam('borrowerTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  placeholder="Ketua Koperasi Konsumen Karyawan"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="input-borrower-org" className="font-semibold text-slate-700">
                Instansi / Perusahaan
              </label>
              <input
                id="input-borrower-org"
                type="text"
                value={params.borrowerOrganization}
                onChange={(e) => updateParam('borrowerOrganization', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                placeholder="PT. transportasi Jakarta"
              />
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="input-sign-city" className="font-semibold text-slate-700">
                    Kota
                  </label>
                  <input
                    id="input-sign-city"
                    type="text"
                    value={params.signCity}
                    onChange={(e) => updateParam('signCity', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    placeholder="Jakarta"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-sign-year" className="font-semibold text-slate-700">
                    Tahun
                  </label>
                  <input
                    id="input-sign-year"
                    type="number"
                    value={params.signDateYear}
                    onChange={(e) => updateParam('signDateYear', parseInt(e.target.value) || 2026)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    placeholder="2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-sign-day" className="font-semibold text-slate-700">
                      Tanggal
                    </label>
                    <span className="text-[10px] text-slate-400">Opsional</span>
                  </div>
                  <input
                    id="input-sign-day"
                    type="text"
                    value={params.signDateDay}
                    onChange={(e) => updateParam('signDateDay', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    placeholder="Contoh: 24 (atau kosong)"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-sign-month" className="font-semibold text-slate-700">
                      Bulan
                    </label>
                    <span className="text-[10px] text-slate-400">Pilih Bulan</span>
                  </div>
                  <select
                    id="input-sign-month"
                    value={params.signDateMonth}
                    onChange={(e) => updateParam('signDateMonth', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  >
                    <option value="">-- Kosongkan (Titik-titik) --</option>
                    {INDONESIAN_MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Date Helper */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                <span>Format Tanda Tangan:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      onChange({
                        ...params,
                        signDateDay: String(now.getDate()),
                        signDateMonth: INDONESIAN_MONTHS[now.getMonth()],
                        signDateYear: now.getFullYear(),
                      });
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                  >
                    Set Hari Ini
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...params,
                        signDateDay: '',
                        signDateMonth: '',
                      });
                    }}
                    className="text-slate-500 hover:text-slate-700 hover:underline"
                  >
                    Kosongkan Tgl/Bulan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Biaya-Biaya Pinjaman (Admin, Provisi, Asuransi, Meterai, Lainnya) */}
      <LoanFeesManager
        nominal={params.nominal}
        fees={params.fees || []}
        onChange={(updatedFees) => updateParam('fees', updatedFees)}
      />
    </div>
  );
};

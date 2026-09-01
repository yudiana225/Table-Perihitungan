import React, { useState } from 'react';
import { LoanParams, InterestMethod } from '../types';
import { INDONESIAN_MONTHS, formatRupiah, formatPercent } from '../utils/calculator';
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

  const updateParam = <K extends keyof LoanParams>(key: K, value: LoanParams[K]) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  const monthlyRate = params.annualRate / 12;

  return (
    <div id="loan-form-container" className="space-y-4">
      {/* Bento Main Control Card (Deep Indigo Hero) */}
      <div className="bg-indigo-600 rounded-3xl p-6 shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
        {/* Background ambient pattern */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Parameter Pinjaman</h2>
                <p className="text-xs text-indigo-200">Atur nominal, bunga & jangka waktu</p>
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

            {/* Input 2: Suku Bunga & Tenor Grid */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Suku Bunga */}
              <div className="group">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-bunga" className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
                    Bunga (% / Thn)
                  </label>
                  <span className="text-[11px] text-indigo-200">
                    ~{monthlyRate.toFixed(2)}%/bln
                  </span>
                </div>
                <div className="border-b border-indigo-400 focus-within:border-white transition-colors pb-1 flex items-baseline">
                  <input
                    id="input-bunga"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={params.annualRate || ''}
                    onChange={(e) => updateParam('annualRate', Math.max(0, Number(e.target.value)))}
                    className="bg-transparent text-2xl font-extrabold text-white w-full focus:outline-none placeholder-indigo-300/50"
                    placeholder="14"
                  />
                  <span className="text-lg font-bold text-indigo-200">%</span>
                </div>
              </div>

              {/* Tenor */}
              <div className="group">
                <label htmlFor="input-tenor" className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1 block">
                  Tenor (Bulan)
                </label>
                <div className="border-b border-indigo-400 focus-within:border-white transition-colors pb-1 flex items-baseline">
                  <input
                    id="input-tenor"
                    type="number"
                    min="0"
                    max="360"
                    value={params.tenorMonths || ''}
                    onChange={(e) => updateParam('tenorMonths', Math.max(0, parseInt(e.target.value) || 0))}
                    className="bg-transparent text-2xl font-extrabold text-white w-full focus:outline-none placeholder-indigo-300/50"
                    placeholder="12"
                  />
                  <span className="text-xs font-bold text-indigo-200 ml-1">Bulan</span>
                </div>
              </div>
            </div>

            {/* Tenor Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {TENOR_PRESETS.map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => updateParam('tenorMonths', months)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    params.tenorMonths === months
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'bg-indigo-700/60 text-indigo-100 hover:bg-indigo-700'
                  }`}
                >
                  {months} Bln
                </button>
              ))}
            </div>

            {/* Metode Perhitungan Bunga */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
                Metode Bunga
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['FLAT', 'EFEKTIF', 'ANUITAS'] as InterestMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    id={`method-btn-${method}`}
                    onClick={() => updateParam('method', method)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                      params.method === method
                        ? 'bg-white text-indigo-900 shadow-md ring-2 ring-amber-400'
                        : 'bg-indigo-700/60 text-indigo-100 hover:bg-indigo-700'
                    }`}
                  >
                    {method === 'FLAT' ? 'Flat' : method === 'EFEKTIF' ? 'Efektif' : 'Anuitas'}
                  </button>
                ))}
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

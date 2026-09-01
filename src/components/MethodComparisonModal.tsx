import React from 'react';
import { LoanParams, InterestMethod } from '../types';
import { calculateLoan, formatRupiah, formatPercent } from '../utils/calculator';
import { X, Check, ArrowRight, HelpCircle, Sparkles, Scale } from 'lucide-react';

interface MethodComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParams: LoanParams;
  onSelectMethod: (method: InterestMethod) => void;
}

export const MethodComparisonModal: React.FC<MethodComparisonModalProps> = ({
  isOpen,
  onClose,
  currentParams,
  onSelectMethod,
}) => {
  if (!isOpen) return null;

  const flatResult = calculateLoan({ ...currentParams, method: 'FLAT' });
  const efektifResult = calculateLoan({ ...currentParams, method: 'EFEKTIF' });
  const anuitasResult = calculateLoan({ ...currentParams, method: 'ANUITAS' });

  const methods = [
    {
      type: 'FLAT' as InterestMethod,
      name: 'Bunga Flat (Tetap)',
      badge: 'Standar Koperasi & Multifinance',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      desc: 'Bunga dihitung rata dari pokok awal pinjaman setiap bulan. Pokok dan bunga selalu bernilai tetap sama.',
      result: flatResult,
      pros: 'Cicilan bulanan stabil & perhitungan paling mudah diverifikasi.',
      cons: 'Total beban bunga lebih tinggi karena tidak menghitung pengurangan sisa pokok.',
    },
    {
      type: 'EFEKTIF' as InterestMethod,
      name: 'Bunga Efektif (Menurun)',
      badge: 'Paling Hemat Bunga',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      desc: 'Bunga dihitung murni dari saldo sisa pokok pinjaman. Cicilan terus menurun dari bulan ke bulan.',
      result: efektifResult,
      pros: 'Total bunga paling hemat & adil mengikuti sisa kewajiban pinjaman.',
      cons: 'Angsuran di bulan-bulan awal relatif paling besar.',
    },
    {
      type: 'ANUITAS' as InterestMethod,
      name: 'Bunga Anuitas (Bank & KPR)',
      badge: 'Standar Kredit Perbankan',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      desc: 'Total angsuran tetap setiap bulan. Porsi bunga di awal sangat tinggi lalu mengecil, sedangkan pokok sebaliknya.',
      result: anuitasResult,
      pros: 'Total cicilan tetap sama tiap bulan sehingga mudah dianggarkan.',
      cons: 'Penurunan saldo pokok pinjaman di awal masa cicilan berjalan lambat.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bento Header */}
        <div className="px-6 py-5 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-white">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white tracking-tight">
                Perbandingan Metode Perhitungan Bunga
              </h3>
              <p className="text-xs text-indigo-100">
                Simulasi pinjaman {formatRupiah(currentParams.nominal)} ({currentParams.tenorMonths} Bulan @ {currentParams.annualRate}%)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-indigo-100 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Comparison Bento Grid */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {methods.map((item) => {
              const isSelected = currentParams.method === item.type;
              return (
                <div
                  key={item.type}
                  className={`rounded-3xl border p-5 flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-white ring-2 ring-indigo-500 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border inline-block mb-2 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-base">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Total Bunga:</span>
                        <strong className="text-amber-700 font-extrabold font-mono text-sm">
                          {formatRupiah(item.result.totalInterest)}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Total Bayar:</span>
                        <strong className="text-slate-900 font-extrabold font-mono text-sm">
                          {formatRupiah(item.result.totalPayment)}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 border-t border-slate-200 pt-2">
                        <span>Cicilan/Bln:</span>
                        <strong className="text-indigo-900 font-bold font-mono">
                          {item.type === 'FLAT' || item.type === 'ANUITAS'
                            ? formatRupiah(item.result.monthlyInstallment)
                            : `${formatRupiah(item.result.firstMonthInstallment)} -> ${formatRupiah(item.result.lastMonthInstallment)}`}
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <p className="text-emerald-800 font-medium flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                        <span>{item.pros}</span>
                      </p>
                      <p className="text-slate-500 flex items-start gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                        <span>{item.cons}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMethod(item.type);
                        onClose();
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>{isSelected ? 'Metode Sedang Aktif' : 'Pilih Metode Ini'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bento Summary insight tile */}
          <div className="p-5 bg-indigo-50/80 border border-indigo-100 rounded-3xl text-xs text-indigo-950 leading-relaxed flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-indigo-900 text-sm block mb-0.5">Rekomendasi Pemilihan Metode:</strong>
              Jika tujuan pinjaman adalah untuk kebutuhan internal koperasi dengan kemudahan pembukuan, metode <span className="font-bold">Bunga Flat</span> paling praktis digunakan. Namun jika ingin meminimalkan total pengeluaran bunga, metode <span className="font-bold text-emerald-700">Bunga Efektif</span> menghemat <span className="font-extrabold font-mono text-emerald-700">{formatRupiah(flatResult.totalInterest - efektifResult.totalInterest)}</span> dibandingkan Flat.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

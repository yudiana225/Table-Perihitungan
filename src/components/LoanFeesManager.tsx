import React, { useState } from 'react';
import { LoanFee, FeeCategory, FeeType } from '../types';
import { formatRupiah, calculateFeeAmount } from '../utils/calculator';
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ShieldCheck,
  FileCheck,
  Percent,
  Coins,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LoanFeesManagerProps {
  nominal: number;
  fees: LoanFee[];
  onChange: (fees: LoanFee[]) => void;
}

const CATEGORY_CONFIG: Record<
  FeeCategory,
  { label: string; icon: React.FC<{ className?: string }>; color: string; badgeBg: string; badgeText: string; defaultName: string; defaultType: FeeType; defaultValue: number }
> = {
  ADMIN: {
    label: 'Biaya Admin',
    icon: Receipt,
    color: 'indigo',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    badgeText: 'Admin',
    defaultName: 'biaya admin',
    defaultType: 'FIXED',
    defaultValue: 500000,
  },
  PROVISI: {
    label: 'Biaya Profinsi',
    icon: Percent,
    color: 'amber',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeText: 'Profinsi',
    defaultName: 'biaya profinsi',
    defaultType: 'PERCENTAGE',
    defaultValue: 1, // 1%
  },
  ASURANSI: {
    label: 'Biaya Asuransi',
    icon: ShieldCheck,
    color: 'blue',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    badgeText: 'Asuransi',
    defaultName: 'biaya asuransi',
    defaultType: 'PERCENTAGE',
    defaultValue: 0.5, // 0.5%
  },
  METERAI: {
    label: 'Biaya Matre',
    icon: FileCheck,
    color: 'emerald',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    badgeText: 'Matre',
    defaultName: 'biaya matre (1.2.3 Lmbr)',
    defaultType: 'FIXED',
    defaultValue: 20000, // Rp 10.000 x 2
  },
  LAINNYA: {
    label: 'Biaya Lain-Lain',
    icon: Layers,
    color: 'purple',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    badgeText: 'Lainnya',
    defaultName: 'biya lain lain',
    defaultType: 'FIXED',
    defaultValue: 250000,
  },
};

export const LoanFeesManager: React.FC<LoanFeesManagerProps> = ({
  nominal,
  fees = [],
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State for Create / Update
  const [formCategory, setFormCategory] = useState<FeeCategory>('ADMIN');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<FeeType>('FIXED');
  const [formValue, setFormValue] = useState<number>(500000);
  const [formNotes, setFormNotes] = useState('');

  // Total active fees calculation
  const totalActiveFees = fees
    .filter((f) => f.enabled)
    .reduce((sum, f) => sum + calculateFeeAmount(f, nominal), 0);

  const netReceived = Math.max(0, nominal - totalActiveFees);

  // CREATE: Open Add Form with Defaults
  const handleOpenAdd = (cat: FeeCategory = 'ADMIN') => {
    const config = CATEGORY_CONFIG[cat];
    setFormCategory(cat);
    setFormName(config.defaultName);
    setFormType(config.defaultType);
    setFormValue(config.defaultValue);
    setFormNotes('');
    setEditingFeeId(null);
    setShowAddForm(true);
    setIsExpanded(true);
  };

  // UPDATE: Open Edit Form for an existing fee
  const handleOpenEdit = (fee: LoanFee) => {
    setFormCategory(fee.category);
    setFormName(fee.name);
    setFormType(fee.type);
    setFormValue(fee.value);
    setFormNotes(fee.notes || '');
    setEditingFeeId(fee.id);
    setShowAddForm(true);
    setIsExpanded(true);
  };

  // SAVE (Create or Update)
  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingFeeId) {
      // Update existing
      const updated = fees.map((f) =>
        f.id === editingFeeId
          ? {
              ...f,
              category: formCategory,
              name: formName.trim(),
              type: formType,
              value: Number(formValue) || 0,
              notes: formNotes.trim() || undefined,
            }
          : f
      );
      onChange(updated);
    } else {
      // Create new
      const newFee: LoanFee = {
        id: `fee-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        category: formCategory,
        name: formName.trim(),
        type: formType,
        value: Number(formValue) || 0,
        enabled: true,
        notes: formNotes.trim() || undefined,
      };
      onChange([...fees, newFee]);
    }

    setShowAddForm(false);
    setEditingFeeId(null);
  };

  // DELETE: Remove specific fee
  const handleDeleteFee = (id: string) => {
    onChange(fees.filter((f) => f.id !== id));
    if (editingFeeId === id) {
      setShowAddForm(false);
      setEditingFeeId(null);
    }
  };

  // TOGGLE: Enable / Disable fee
  const handleToggleFee = (id: string) => {
    onChange(
      fees.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  // Reset all fees to standard defaults
  const handleResetToStandard = () => {
    const standardFees: LoanFee[] = [
      {
        id: 'fee-admin-default',
        category: 'ADMIN',
        name: 'biaya admin',
        type: 'FIXED',
        value: 500000,
        enabled: true,
      },
      {
        id: 'fee-provisi-default',
        category: 'PROVISI',
        name: 'biaya profinsi',
        type: 'PERCENTAGE',
        value: 1.0,
        enabled: true,
      },
      {
        id: 'fee-asuransi-default',
        category: 'ASURANSI',
        name: 'biaya asuransi',
        type: 'PERCENTAGE',
        value: 0.5,
        enabled: true,
      },
      {
        id: 'fee-meterai-default',
        category: 'METERAI',
        name: 'biaya matre (1.2.3 Lmbr)',
        type: 'FIXED',
        value: 20000,
        enabled: true,
      },
    ];
    onChange(standardFees);
  };

  // Clear all fees
  const handleClearAllFees = () => {
    onChange([]);
    setShowAddForm(false);
  };

  return (
    <div
      id="loan-fees-container"
      className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-all"
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg text-white">
                Biaya Potongan Administrasi
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                {fees.filter((f) => f.enabled).length} Aktif
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Admin, Provisi, Asuransi, Meterai & Biaya Lainnya
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isExpanded ? 'Tutup Rincian' : 'Buka Rincian'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Preset Buttons (Create Helpers) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tambah Jenis Biaya
              </span>
              <div className="flex gap-2">
                {fees.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFees}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  'ADMIN',
                  'PROVISI',
                  'ASURANSI',
                  'METERAI',
                  'LAINNYA',
                ] as FeeCategory[]
              ).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const IconComponent = config.icon;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleOpenAdd(cat)}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-200 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-all group shadow-2xs active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    <span>{config.label.replace('Biaya ', '+ ')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add / Edit Form Modal/Drawer */}
          {showAddForm && (
            <div
              id="fee-form-dialog"
              className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 transition-all animate-in fade-in duration-200 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100 mb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
                  {editingFeeId ? (
                    <>
                      <Edit2 className="w-4 h-4 text-indigo-600" />
                      <span>Edit Rincian Biaya</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span>Tambah Biaya Baru</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-indigo-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveFee} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kategori Biaya
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const cat = e.target.value as FeeCategory;
                        setFormCategory(cat);
                        if (!editingFeeId) {
                          setFormName(CATEGORY_CONFIG[cat].defaultName);
                          setFormType(CATEGORY_CONFIG[cat].defaultType);
                          setFormValue(CATEGORY_CONFIG[cat].defaultValue);
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="ADMIN">Biaya Admin</option>
                      <option value="PROVISI">Biaya Provisi</option>
                      <option value="ASURANSI">Biaya Asuransi</option>
                      <option value="METERAI">Biaya Meterai</option>
                      <option value="LAINNYA">Biaya Lainnya</option>
                    </select>
                  </div>

                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama / Keterangan Biaya
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Biaya Provisi 1%"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Calculation Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipe Perhitungan
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setFormType('FIXED')}
                        className={`text-xs py-1 rounded-md font-semibold transition-all ${
                          formType === 'FIXED'
                            ? 'bg-white text-indigo-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Nominal (Rp)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormType('PERCENTAGE')}
                        className={`text-xs py-1 rounded-md font-semibold transition-all ${
                          formType === 'PERCENTAGE'
                            ? 'bg-white text-indigo-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Persen (%)
                      </button>
                    </div>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {formType === 'PERCENTAGE'
                        ? 'Nilai Persentase (%)'
                        : 'Nominal Rupiah (Rp)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step={formType === 'PERCENTAGE' ? '0.01' : '1000'}
                        value={formValue || ''}
                        onChange={(e) =>
                          setFormValue(Math.max(0, Number(e.target.value)))
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1.5 text-xs font-semibold text-slate-400">
                        {formType === 'PERCENTAGE' ? '%' : 'IDR'}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Amount Preview */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Estimasi Potongan
                    </label>
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-900 flex items-center justify-between">
                      <span>Rp</span>
                      <span>
                        {formatRupiah(
                          formType === 'PERCENTAGE'
                            ? (nominal * (formValue || 0)) / 100
                            : formValue || 0,
                          false
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-indigo-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingFeeId ? 'Perbarui Biaya' : 'Simpan Biaya'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* READ: List of Active & Configured Fees */}
          <div className="space-y-2">
            {fees.length === 0 ? (
              <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Belum ada komponen biaya pinjaman yang ditambahkan.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gunakan tombol preset di atas untuk menambahkan biaya Admin, Provisi, Asuransi, atau Meterai.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                {fees.map((fee) => {
                  const config = CATEGORY_CONFIG[fee.category] || CATEGORY_CONFIG.LAINNYA;
                  const calculatedAmount = calculateFeeAmount(fee, nominal);
                  const isEditing = editingFeeId === fee.id;

                  return (
                    <div
                      key={fee.id}
                      className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        !fee.enabled
                          ? 'bg-slate-50/80 opacity-60'
                          : isEditing
                          ? 'bg-indigo-50/50'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Left: Checkbox + Category + Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={fee.enabled}
                          onChange={() => handleToggleFee(fee.id)}
                          className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          title={fee.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${config.badgeBg}`}
                            >
                              {config.badgeText}
                            </span>
                            <span
                              className={`text-xs font-bold text-slate-900 truncate ${
                                !fee.enabled ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {fee.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {fee.type === 'PERCENTAGE' ? (
                              <span>
                                {fee.value}% × {formatRupiah(nominal)}
                              </span>
                            ) : (
                              <span>Nominal Tetap</span>
                            )}
                            {fee.notes && (
                              <span className="text-slate-400 italic">
                                • {fee.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount + Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-right">
                          <span
                            className={`text-xs sm:text-sm font-mono font-extrabold ${
                              fee.enabled ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {formatRupiah(calculatedAmount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(fee)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Biaya"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFee(fee.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Biaya"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SUMMARY: Total Fees & Net Disbursement Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Total Potongan Biaya */}
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-0.5">
                  Total Potongan Biaya
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-rose-300">
                  {formatRupiah(totalActiveFees)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {nominal > 0
                    ? `~${((totalActiveFees / nominal) * 100).toFixed(2)}% dari pokok`
                    : '0%'}
                </div>
              </div>

              {/* Pencairan Bersih Diterima */}
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider mb-0.5">
                  Pencairan Bersih (Diterima)
                </div>
                <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-400">
                  {formatRupiah(netReceived)}
                </div>
                <div className="text-[10px] text-emerald-200/80 mt-0.5">
                  Pokok ({formatRupiah(nominal)}) - Biaya ({formatRupiah(totalActiveFees)})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

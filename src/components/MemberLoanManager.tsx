import React, { useState } from 'react';
import { MemberLoanRecord, MemberRecord } from '../types/memberTypes';
import { InterestMethod, LoanParams } from '../types';
import {
  DollarSign,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  Calculator,
} from 'lucide-react';
import { formatRupiah, calculateLoan } from '../utils/calculator';

interface MemberLoanManagerProps {
  loans: MemberLoanRecord[];
  members: MemberRecord[];
  onAddLoan: (loan: Omit<MemberLoanRecord, 'id' | 'monthlyInstallment' | 'remainingBalance'>) => void;
  onUpdateLoan: (loan: MemberLoanRecord) => void;
  onDeleteLoan: (id: string) => void;
  onLoadIntoSimulation: (loan: MemberLoanRecord) => void;
}

export const MemberLoanManager: React.FC<MemberLoanManagerProps> = ({
  loans,
  members,
  onAddLoan,
  onUpdateLoan,
  onDeleteLoan,
  onLoadIntoSimulation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAID_OFF' | 'OVERDUE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<MemberLoanRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    loanNo: '',
    memberId: '',
    principal: 10000000,
    annualRate: 12,
    tenorMonths: 12,
    method: 'ANUITAS' as InterestMethod,
    startDate: new Date().toISOString().split('T')[0],
    disbursementDate: new Date().toISOString().split('T')[0],
    purpose: 'Modal Usaha Anggota',
    status: 'ACTIVE' as 'ACTIVE' | 'PAID_OFF' | 'OVERDUE',
    notes: '',
  });

  const handleOpenAdd = (presetMemberId?: string) => {
    const nextNum = String(loans.length + 1).padStart(3, '0');
    const defaultMember = presetMemberId
      ? members.find((m) => m.id === presetMemberId)
      : members[0];

    setEditingLoan(null);
    setFormData({
      loanNo: `PJ-${new Date().getFullYear()}-${nextNum}`,
      memberId: defaultMember ? defaultMember.id : members[0]?.id || '',
      principal: 10000000,
      annualRate: 12,
      tenorMonths: 12,
      method: 'ANUITAS',
      startDate: new Date().toISOString().split('T')[0],
      disbursementDate: new Date().toISOString().split('T')[0],
      purpose: 'Modal Usaha Anggota',
      status: 'ACTIVE',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loan: MemberLoanRecord) => {
    setEditingLoan(loan);
    setFormData({
      loanNo: loan.loanNo,
      memberId: loan.memberId,
      principal: loan.principal,
      annualRate: loan.annualRate,
      tenorMonths: loan.tenorMonths,
      method: loan.method,
      startDate: loan.startDate,
      disbursementDate: loan.disbursementDate,
      purpose: loan.purpose,
      status: loan.status,
      notes: loan.notes || '',
    });
    setIsModalOpen(true);
  };

  // Preview live installment calculation inside modal
  const previewSimulation = React.useMemo(() => {
    try {
      const p: LoanParams = {
        nominal: Number(formData.principal) || 0,
        annualRate: Number(formData.annualRate) || 0,
        tenorMonths: Number(formData.tenorMonths) || 1,
        method: formData.method,
        startMonth: 8,
        startYear: 2026,
        paymentTiming: 'SETIAP AKHIR BULAN',
        lenderName: '',
        lenderIdentity: '',
        lenderAddress: '',
        borrowerName: '',
        borrowerTitle: '',
        borrowerOrganization: '',
        signCity: 'Jakarta',
        signDateDay: '',
        signDateMonth: '',
        signDateYear: 2026,
        fees: [],
      };
      const res = calculateLoan(p);
      return {
        firstInstallment: res.firstMonthInstallment || res.monthlyInstallment,
        totalInterest: res.totalInterest,
        totalPayment: res.totalPayment,
      };
    } catch {
      return { firstInstallment: 0, totalInterest: 0, totalPayment: 0 };
    }
  }, [formData.principal, formData.annualRate, formData.tenorMonths, formData.method]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.loanNo || !formData.principal) return;

    const selectedMember = members.find((m) => m.id === formData.memberId);
    const memberName = selectedMember ? selectedMember.name : 'Unknown';
    const memberNo = selectedMember ? selectedMember.memberNo : '-';

    if (editingLoan) {
      onUpdateLoan({
        ...editingLoan,
        loanNo: formData.loanNo,
        memberId: formData.memberId,
        memberName,
        memberNo,
        principal: Number(formData.principal),
        annualRate: Number(formData.annualRate),
        tenorMonths: Number(formData.tenorMonths),
        method: formData.method,
        startDate: formData.startDate,
        disbursementDate: formData.disbursementDate,
        purpose: formData.purpose,
        status: formData.status,
        monthlyInstallment: previewSimulation.firstInstallment,
        remainingBalance:
          formData.status === 'PAID_OFF'
            ? 0
            : editingLoan.remainingBalance || Number(formData.principal),
        notes: formData.notes,
      });
    } else {
      onAddLoan({
        loanNo: formData.loanNo,
        memberId: formData.memberId,
        memberName,
        memberNo,
        principal: Number(formData.principal),
        annualRate: Number(formData.annualRate),
        tenorMonths: Number(formData.tenorMonths),
        method: formData.method,
        startDate: formData.startDate,
        disbursementDate: formData.disbursementDate,
        purpose: formData.purpose,
        status: formData.status,
        notes: formData.notes,
      });
    }
    setIsModalOpen(false);
  };

  const filteredLoans = loans.filter((l) => {
    const matchSearch =
      l.loanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' ? true : l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalDisbursed = loans.reduce((acc, curr) => acc + curr.principal, 0);
  const totalActiveBalance = loans
    .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
    .reduce((acc, curr) => acc + curr.remainingBalance, 0);

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                  Pencatatan Pinjaman Anggota
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>{loans.length} Pinjaman Dicatat</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Register akad pinjaman anggota, plafon pokok, suku bunga, tenor, cicilan bulanan, dan status pelunasan.
              </p>
            </div>
          </div>

          <div className="no-print flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pinjaman Baru</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/80">
            <span className="text-slate-500 font-semibold block">Total Plafon Disalurkan:</span>
            <span className="text-base font-extrabold text-indigo-950 block mt-0.5">
              {formatRupiah(totalDisbursed)}
            </span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100/80">
            <span className="text-slate-500 font-semibold block">Sisa Pokok Aktif:</span>
            <span className="text-base font-extrabold text-emerald-950 block mt-0.5">
              {formatRupiah(totalActiveBalance)}
            </span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100/80 col-span-2 sm:col-span-1">
            <span className="text-slate-500 font-semibold block">Pinjaman Aktif / Lunas:</span>
            <span className="text-base font-extrabold text-slate-900 block mt-0.5">
              {loans.filter((l) => l.status === 'ACTIVE').length} Aktif / {loans.filter((l) => l.status === 'PAID_OFF').length} Lunas
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="no-print mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari No. Pinjaman, Nama Anggota, Peruntukan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
            {(['ALL', 'ACTIVE', 'PAID_OFF', 'OVERDUE'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all border ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    st === 'ACTIVE'
                      ? 'bg-blue-400'
                      : st === 'PAID_OFF'
                      ? 'bg-emerald-400'
                      : st === 'OVERDUE'
                      ? 'bg-rose-400'
                      : 'bg-indigo-400'
                  }`}
                ></span>
                <span>
                  {st === 'ALL'
                    ? 'Semua'
                    : st === 'ACTIVE'
                    ? 'Berjalan'
                    : st === 'PAID_OFF'
                    ? 'Lunas'
                    : 'Menunggak'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table of Loan Records */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-10 text-center">No</th>
              <th className="py-3 px-4">No. Pinjaman & Anggota</th>
              <th className="py-3 px-4 text-right">Plafon Pokok</th>
              <th className="py-3 px-4">Bunga & Tenor</th>
              <th className="py-3 px-4 text-right">Est. Cicilan/Bln</th>
              <th className="py-3 px-4 text-right">Sisa Saldo</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right no-print">Aksi & Simulasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span>Belum ada data pinjaman yang tercatat.</span>
                </td>
              </tr>
            ) : (
              filteredLoans.map((loan, idx) => (
                <tr
                  key={loan.id}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-indigo-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70 text-[11px]">
                        {loan.loanNo}
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm mt-1">
                      {loan.memberName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ID: {loan.memberNo} • {loan.purpose}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                    {formatRupiah(loan.principal)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">
                      {loan.annualRate}% / thn ({loan.method})
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{loan.tenorMonths} Bulan • Mulai {loan.startDate}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-indigo-700">
                    {formatRupiah(loan.monthlyInstallment)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                    {formatRupiah(loan.remainingBalance)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        loan.status === 'ACTIVE'
                          ? 'bg-blue-50 text-blue-900 border-blue-200'
                          : loan.status === 'PAID_OFF'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          loan.status === 'ACTIVE'
                            ? 'bg-blue-500'
                            : loan.status === 'PAID_OFF'
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}
                      ></span>
                      <span>
                        {loan.status === 'ACTIVE'
                          ? 'Berjalan'
                          : loan.status === 'PAID_OFF'
                          ? 'Lunas'
                          : 'Menunggak'}
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right no-print">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLoadIntoSimulation(loan)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-2xs transition-all active:scale-95"
                        title="Muat data ini ke kalkulator & tabel resmi untuk dicetak"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>Buka Jadwal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(loan)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        title="Edit Pinjaman"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLoan(loan.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all"
                        title="Hapus Pinjaman"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Loan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingLoan ? 'Edit Akad Pinjaman Anggota' : 'Pencatatan Akad Pinjaman Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Loan Number */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    No. Pinjaman / Akad: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.loanNo}
                    onChange={(e) => setFormData({ ...formData, loanNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="PJ-2026-001"
                  />
                </div>

                {/* Member Selection */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Pilih Anggota Peminjam: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {members.length === 0 ? (
                      <option value="">Belum ada data anggota terdaftar</option>
                    ) : (
                      members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.memberNo} - {m.name} ({m.nik ? `NIK: ${m.nik}` : 'No NIK'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Financial Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Plafon Pokok Pinjaman (Rp):
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="100000"
                    required
                    value={formData.principal}
                    onChange={(e) =>
                      setFormData({ ...formData, principal: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Suku Bunga (% / Tahun):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.annualRate}
                    onChange={(e) =>
                      setFormData({ ...formData, annualRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tenor (Bulan):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={formData.tenorMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, tenorMonths: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Metode Perhitungan:
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) =>
                      setFormData({ ...formData, method: e.target.value as InterestMethod })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ANUITAS">Anuitas (Cicilan Tetap)</option>
                    <option value="EFEKTIF">Efektif (Bunga Menurun)</option>
                    <option value="FLAT">Flat (Bunga Rata)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tgl Pembayaran Dimulai:
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Status Pinjaman:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'ACTIVE' | 'PAID_OFF' | 'OVERDUE',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ACTIVE">Berjalan (ACTIVE)</option>
                    <option value="PAID_OFF">Lunas (PAID_OFF)</option>
                    <option value="OVERDUE">Menunggak (OVERDUE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Keperluan / Peruntukan Pinjaman:
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: Tambahan Modal Usaha Warung / Sembako"
                />
              </div>

              {/* Realtime Calculation Preview */}
              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-slate-500 font-medium block">
                    Perkiraan Cicilan Bulan Pertama:
                  </span>
                  <span className="text-base font-extrabold text-indigo-950">
                    {formatRupiah(previewSimulation.firstInstallment)} / bulan
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-medium block">
                    Total Estimasi Bunga:
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {formatRupiah(previewSimulation.totalInterest)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95"
                >
                  {editingLoan ? 'Simpan Perubahan' : 'Catat Akad Pinjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

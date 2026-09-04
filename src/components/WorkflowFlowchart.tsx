import React, { useState } from 'react';
import {
  GitCommit,
  FileSignature,
  Building2,
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowDown,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Printer,
  ChevronRight,
  FileText,
  Sparkles,
  Layers,
  Calendar,
  DollarSign,
  Briefcase,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export interface FlowchartStep {
  id: string;
  stepNumber: number;
  category: string;
  categoryColor: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
  title: string;
  parties: {
    name: string;
    role: string;
    badgeColor: string;
  }[];
  description: string;
  documentOutput: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  notes?: string;
}

const DEFAULT_CATEGORIES = [
  {
    name: 'Kesepakatan & Legalitas',
    color: {
      bg: 'bg-indigo-50/90',
      text: 'text-indigo-900',
      border: 'border-indigo-200/80',
      dot: 'bg-indigo-600',
    },
  },
  {
    name: 'Verifikasi & Administrasi',
    color: {
      bg: 'bg-amber-50/90',
      text: 'text-amber-900',
      border: 'border-amber-200/80',
      dot: 'bg-amber-500',
    },
  },
  {
    name: 'Pencairan Modal (Disbursement)',
    color: {
      bg: 'bg-emerald-50/90',
      text: 'text-emerald-900',
      border: 'border-emerald-200/80',
      dot: 'bg-emerald-600',
    },
  },
  {
    name: 'Pengelolaan & Penyaluran',
    color: {
      bg: 'bg-blue-50/90',
      text: 'text-blue-900',
      border: 'border-blue-200/80',
      dot: 'bg-blue-600',
    },
  },
  {
    name: 'Pembayaran Cicilan & Monitoring',
    color: {
      bg: 'bg-purple-50/90',
      text: 'text-purple-900',
      border: 'border-purple-200/80',
      dot: 'bg-purple-600',
    },
  },
  {
    name: 'Pelunasan & Evaluasi',
    color: {
      bg: 'bg-slate-100',
      text: 'text-slate-900',
      border: 'border-slate-300',
      dot: 'bg-slate-600',
    },
  },
];

const INITIAL_STEPS: FlowchartStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    category: 'Kesepakatan & Legalitas',
    categoryColor: DEFAULT_CATEGORIES[0].color,
    title: 'Penandatanganan Surat Kesepakatan Kerjasama PMK',
    parties: [
      {
        name: 'PMK (Pemberi Modal Kerja)',
        role: 'Investor / Lender',
        badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
      },
      {
        name: 'PMK (Penerima Modal Kerja)',
        role: 'Ketua Koperasi',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      },
    ],
    description:
      'PMK (Pemberi Modal Kerja) dengan PMK (Penerima Modal Kerja) menandatangani surat kesepakatan kerjasama yang ditandatangani oleh PMK Investor/Lender dan PMK Ketua Koperasi sebagai landasan hukum penyaluran modal.',
    documentOutput: 'Surat Perjanjian Kerjasama (Akta / MOU Kerjasama Modal Kerja)',
    status: 'COMPLETED',
    notes: 'Ditandatangani di atas meterai sah kedua belah pihak.',
  },
  {
    id: 'step-2',
    stepNumber: 2,
    category: 'Verifikasi & Administrasi',
    categoryColor: DEFAULT_CATEGORIES[1].color,
    title: 'Verifikasi Dokumen & Pengesahan Rekening Operasional',
    parties: [
      {
        name: 'Tim Legal & Finansial',
        role: 'Verifikator PMK Lender',
        badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
      },
      {
        name: 'Pengurus Koperasi',
        role: 'Sekretaris / Bendahara',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      },
    ],
    description:
      'Pemeriksaan kelengkapan legalitas koperasi, surat ketetapan anggota, nomor rekening penampung resmi, serta jadwal simulasi cicilan pinjaman yang telah disetujui.',
    documentOutput: 'Berita Acara Verifikasi Kelayakan (BAVK) & Tabel Simulasi Final',
    status: 'IN_PROGRESS',
    notes: 'Memastikan rekening penampung atas nama resmi badan hukum Koperasi.',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    category: 'Pencairan Modal (Disbursement)',
    categoryColor: DEFAULT_CATEGORIES[2].color,
    title: 'Pencairan Dana Modal Kerja ke Rekening Koperasi',
    parties: [
      {
        name: 'PMK (Pemberi Modal Kerja)',
        role: 'Investor / Lender',
        badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
      },
      {
        name: 'Bank Kustodian / Mitra',
        role: 'Sistem Pembayaran',
        badgeColor: 'bg-slate-50 text-slate-800 border-slate-200',
      },
    ],
    description:
      'Transfer dana modal kerja pokok (netto setelah potongan biaya admin/provisi jika ada) ke rekening resmi koperasi sesuai nominal yang disepakati.',
    documentOutput: 'Bukti Transfer Bank & Kwitansi Resmi Penerimaan Modal Kerja',
    status: 'PENDING',
    notes: 'Dana dicairkan maksimal 1-3 hari kerja setelah dokumen lengkap.',
  },
  {
    id: 'step-4',
    stepNumber: 4,
    category: 'Pengelolaan & Penyaluran',
    categoryColor: DEFAULT_CATEGORIES[3].color,
    title: 'Penyaluran Modal Kerja kepada Anggota Koperasi',
    parties: [
      {
        name: 'Pengurus Koperasi',
        role: 'Pengelola Unit Simpan Pinjam / Usaha',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      },
      {
        name: 'Anggota Koperasi / Mitra Usaha',
        role: 'Penerima Manfaat Usaha',
        badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      },
    ],
    description:
      'Koperasi menyalurkan modal kerja yang diterima untuk memperkuat permodalan unit usaha atau pinjaman produktif anggota sesuai tata tertib koperasi.',
    documentOutput: 'Laporan Penyaluran Dana & Daftar Akad Anggota Koperasi',
    status: 'PENDING',
    notes: 'Penyaluran berkala dengan monitoring peruntukan modal.',
  },
  {
    id: 'step-5',
    stepNumber: 5,
    category: 'Pembayaran Cicilan & Monitoring',
    categoryColor: DEFAULT_CATEGORIES[4].color,
    title: 'Pembayaran Angsuran Pokok & Bunga Bulanan',
    parties: [
      {
        name: 'PMK (Penerima Modal Kerja)',
        role: 'Ketua & Bendahara Koperasi',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      },
      {
        name: 'PMK (Pemberi Modal Kerja)',
        role: 'Investor / Lender',
        badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
      },
    ],
    description:
      'Koperasi membayarkan kewajiban angsuran bulanan (Pokok + Bunga) secara tepat waktu pada setiap tanggal jatuh tempo sesuai tabel perhitungan pinjaman.',
    documentOutput: 'Bukti Pembayaran Bulanan & Rekonsiliasi Saldo Pinjaman',
    status: 'PENDING',
    notes: 'Pelaporan status pembayaran secara realtime setiap bulan.',
  },
];

export const WorkflowFlowchart: React.FC = () => {
  const [steps, setSteps] = useState<FlowchartStep[]>(INITIAL_STEPS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeStepModal, setActiveStepModal] = useState<FlowchartStep | null>(null);
  const [viewMode, setViewMode] = useState<'FLOW' | 'CARDS' | 'TABLE'>('FLOW');

  const filteredSteps = selectedCategory === 'ALL'
    ? steps
    : steps.filter((s) => s.category === selectedCategory);

  const categories = ['ALL', ...Array.from(new Set(steps.map((s) => s.category)))];

  const handlePrintFlowchart = () => {
    window.print();
  };

  const handleUpdateStep = (updated: FlowchartStep) => {
    setSteps(steps.map((s) => (s.id === updated.id ? updated : s)));
    setActiveStepModal(null);
  };

  const handleAddNewStep = () => {
    const nextNumber = steps.length + 1;
    const newStep: FlowchartStep = {
      id: `step-${Date.now()}`,
      stepNumber: nextNumber,
      category: 'Kesepakatan & Legalitas',
      categoryColor: DEFAULT_CATEGORIES[0].color,
      title: `Tahapan Alur Kerjasama #${nextNumber}`,
      parties: [
        {
          name: 'PMK (Pemberi Modal Kerja)',
          role: 'Investor / Lender',
          badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
        },
        {
          name: 'PMK (Penerima Modal Kerja)',
          role: 'Ketua Koperasi',
          badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        },
      ],
      description: 'Deskripsi tahapan pelaksanaan alur kerja sama.',
      documentOutput: 'Dokumen / Bukti Pelaksanaan',
      status: 'PENDING',
      notes: '',
    };
    setSteps([...steps, newStep]);
    setActiveStepModal(newStep);
  };

  const handleDeleteStep = (id: string) => {
    const updated = steps
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(updated);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      {/* Flowchart Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                  Flowchart Alur Kerjasama PMK
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>{steps.length} Tahapan Berurutan</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Diagram alur resmi perjanjian permodalan antara Pemberi Modal Kerja (PMK Investor) & Penerima Modal Kerja (PMK Koperasi).
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="no-print flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('FLOW')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'FLOW'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Diagram Alur
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'CARDS'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kartu Rinci
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'TABLE'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabel Matriks
              </button>
            </div>

            {/* Add Step Button */}
            <button
              type="button"
              onClick={handleAddNewStep}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Tahapan</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrintFlowchart}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Flowchart</span>
            </button>
          </div>
        </div>

        {/* Category Filters with Dot Badges */}
        <div className="no-print mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Kategori:</span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected
                      ? 'bg-amber-400'
                      : cat === 'ALL'
                      ? 'bg-slate-400'
                      : 'bg-indigo-500'
                  }`}
                ></span>
                <span>{cat === 'ALL' ? 'Semua Kategori' : cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Flowchart Content Area */}
      <div className="p-5 sm:p-7">
        {/* VIEW 1: FLOW DIAGRAM */}
        {viewMode === 'FLOW' && (
          <div className="space-y-6">
            {filteredSteps.map((step, index) => {
              const isLast = index === filteredSteps.length - 1;

              return (
                <div key={step.id} className="relative">
                  {/* Step Card */}
                  <div className="relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all p-5 sm:p-6 group">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Number Badge & Main Details */}
                      <div className="flex items-start gap-4">
                        {/* Number Circle Badge with Dot Style */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md shadow-indigo-100 shrink-0">
                          {step.stepNumber}
                        </div>

                        <div className="space-y-2">
                          {/* Category Dot Badge */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${step.categoryColor.bg} ${step.categoryColor.text} ${step.categoryColor.border}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${step.categoryColor.dot}`}
                              ></span>
                              <span>Kategori: {step.category}</span>
                            </span>

                            {/* Status Indicator */}
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                step.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : step.status === 'IN_PROGRESS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {step.status === 'COMPLETED'
                                ? '✓ Selesai / Disetujui'
                                : step.status === 'IN_PROGRESS'
                                ? '⏳ Sedang Berjalan'
                                : '○ Rencana'}
                            </span>
                          </div>

                          {/* Step Title */}
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                            {step.title}
                          </h3>

                          {/* Parties Involved (Pihak Terkait) */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-xs font-semibold text-slate-500 mr-1">
                              Pihak Terlibat:
                            </span>
                            {step.parties.map((party, pIdx) => (
                              <span
                                key={pIdx}
                                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${party.badgeColor}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                                <span>{party.name}</span>
                                <span className="text-[11px] font-medium opacity-80">
                                  ({party.role})
                                </span>
                              </span>
                            ))}
                          </div>

                          {/* Step Description */}
                          <p className="text-sm text-slate-700 leading-relaxed pt-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                            {step.description}
                          </p>

                          {/* Output / Document Requirement */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-indigo-50/60 border border-indigo-100 px-3 py-1 rounded-lg">
                              <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>Output Dokumen:</span>
                              <span className="font-semibold text-slate-700">
                                {step.documentOutput}
                              </span>
                            </span>
                            {step.notes && (
                              <span className="text-xs text-slate-500 italic">
                                * {step.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="no-print flex items-center lg:flex-col justify-end gap-1.5 shrink-0 self-start">
                        <button
                          type="button"
                          onClick={() => setActiveStepModal(step)}
                          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                          title="Edit detail tahapan ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteStep(step.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 border border-transparent hover:border-rose-200 transition-all"
                            title="Hapus tahapan ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flow Connector Arrow */}
                  {!isLast && (
                    <div className="flex justify-center my-3 relative">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500 shadow-2xs z-10">
                        <ArrowDown className="w-4 h-4 text-indigo-600" />
                      </div>
                      {/* Vertical line indicator */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-slate-200 -z-0"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: CARDS GRID */}
        {viewMode === 'CARDS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSteps.map((step) => (
              <div
                key={step.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        #{step.stepNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${step.categoryColor.bg} ${step.categoryColor.text} ${step.categoryColor.border}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${step.categoryColor.dot}`}
                        ></span>
                        <span>{step.category}</span>
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : step.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                    {step.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-slate-500 font-medium">Output:</span>
                    <span>{step.documentOutput}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1 no-print">
                    <button
                      type="button"
                      onClick={() => setActiveStepModal(step)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1"
                    >
                      Edit Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 3: TABLE MATRIX */}
        {viewMode === 'TABLE' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3 text-center w-12">No</th>
                  <th className="p-3 w-48">Kategori</th>
                  <th className="p-3 w-64">Nama Tahapan Alur</th>
                  <th className="p-3">Pihak Terlibat & Deskripsi</th>
                  <th className="p-3 w-56">Output / Dokumen</th>
                  <th className="p-3 text-center w-28">Status</th>
                  <th className="p-3 text-center w-20 no-print">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSteps.map((step) => (
                  <tr key={step.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-center text-indigo-700 bg-slate-50/50">
                      {step.stepNumber}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full border ${step.categoryColor.bg} ${step.categoryColor.text} ${step.categoryColor.border}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${step.categoryColor.dot}`}
                        ></span>
                        <span>{step.category}</span>
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {step.title}
                    </td>
                    <td className="p-3 space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {step.parties.map((p, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${p.badgeColor}`}
                          >
                            {p.name} ({p.role})
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {step.description}
                      </p>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {step.documentOutput}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          step.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : step.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {step.status}
                      </span>
                    </td>
                    <td className="p-3 text-center no-print">
                      <button
                        type="button"
                        onClick={() => setActiveStepModal(step)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Detail Step Modal */}
      {activeStepModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  #{activeStepModal.stepNumber}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Edit Detail Tahapan Flowchart
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveStepModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Category */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Kategori Tahapan:
                </label>
                <select
                  value={activeStepModal.category}
                  onChange={(e) => {
                    const matched = DEFAULT_CATEGORIES.find(
                      (c) => c.name === e.target.value
                    );
                    setActiveStepModal({
                      ...activeStepModal,
                      category: e.target.value,
                      categoryColor: matched
                        ? matched.color
                        : DEFAULT_CATEGORIES[0].color,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Judul / Nama Tahapan:
                </label>
                <input
                  type="text"
                  value={activeStepModal.title}
                  onChange={(e) =>
                    setActiveStepModal({
                      ...activeStepModal,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Deskripsi Pelaksanaan Alur:
                </label>
                <textarea
                  rows={3}
                  value={activeStepModal.description}
                  onChange={(e) =>
                    setActiveStepModal({
                      ...activeStepModal,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Output Document */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Output Dokumen / Surat:
                </label>
                <input
                  type="text"
                  value={activeStepModal.documentOutput}
                  onChange={(e) =>
                    setActiveStepModal({
                      ...activeStepModal,
                      documentOutput: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Status Pelaksanaan:
                </label>
                <select
                  value={activeStepModal.status}
                  onChange={(e) =>
                    setActiveStepModal({
                      ...activeStepModal,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800"
                >
                  <option value="COMPLETED">Selesai (COMPLETED)</option>
                  <option value="IN_PROGRESS">Sedang Berjalan (IN_PROGRESS)</option>
                  <option value="PENDING">Menunggu / Rencana (PENDING)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveStepModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStep(activeStepModal)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

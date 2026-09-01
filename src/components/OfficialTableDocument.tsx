import React, { useState, useMemo } from 'react';
import { LoanParams, LoanCalculationResult, TableStyleTheme, TableDensity } from '../types';
import {
  INDONESIAN_MONTHS,
  formatRupiah,
  formatNumberIndo,
  formatPercent,
  formatSignatureDate,
  numberToWordsIndonesian,
  exportToExcel,
  exportToCSV,
} from '../utils/calculator';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Eye,
  FileCheck2,
  Lock,
  Unlock,
  Palette,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Calendar,
} from 'lucide-react';

interface OfficialTableDocumentProps {
  params: LoanParams;
  result: LoanCalculationResult;
  onParamsChange?: (params: LoanParams) => void;
}

const UI_STYLE_OPTIONS: { id: TableStyleTheme; label: string; desc: string; previewBadge: string }[] = [
  {
    id: 'classic-official',
    label: 'Format Baku Resmi',
    desc: 'Kuning & Merah Standar Koperasi/Bank',
    previewBadge: 'bg-gradient-to-r from-amber-400 to-red-600 text-white',
  },
  {
    id: 'executive-navy',
    label: 'Executive Corporate',
    desc: 'Deep Navy & Slate Indigo Elegan',
    previewBadge: 'bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white',
  },
  {
    id: 'emerald-fintech',
    label: 'Emerald FinTech',
    desc: 'Modern Digital Banking Emerald Teal',
    previewBadge: 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white',
  },
  {
    id: 'clean-minimal',
    label: 'Minimalist Clean',
    desc: 'Monokromatik Slate Bersih & Kontras',
    previewBadge: 'bg-gradient-to-r from-slate-700 to-slate-900 text-white',
  },
];

export const OfficialTableDocument: React.FC<OfficialTableDocumentProps> = ({
  params,
  result,
  onParamsChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRemainingColumn, setShowRemainingColumn] = useState(false);
  const [showFeesBreakdown, setShowFeesBreakdown] = useState(true);
  const [tableTheme, setTableTheme] = useState<TableStyleTheme>('executive-navy');
  const [density, setDensity] = useState<TableDensity>('comfortable');
  const [isEditLocked, setIsEditLocked] = useState(false);
  const [customTitle, setCustomTitle] = useState('RINCIAN PEMBAYARAN CICILAN PINJAMAN');
  const [hoveredRowNo, setHoveredRowNo] = useState<number | null>(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState<'ALL' | number>('ALL');

  const updateParam = <K extends keyof LoanParams>(key: K, value: LoanParams[K]) => {
    if (onParamsChange && !isEditLocked) {
      onParamsChange({
        ...params,
        [key]: value,
      });
    }
  };

  const startMonthName = INDONESIAN_MONTHS[params.startMonth]?.toUpperCase();
  const paymentStartText = `${params.paymentTiming.toUpperCase()} MULAI ${startMonthName} ${params.startYear}`;

  // Filter rows by year if selected
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(result.rows.map((r) => r.year)));
    return years;
  }, [result.rows]);

  const displayedRows = useMemo(() => {
    if (selectedYearFilter === 'ALL') return result.rows;
    return result.rows.filter((r) => r.year === selectedYearFilter);
  }, [result.rows, selectedYearFilter]);

  const handlePrint = () => {
    // If filtered by year, reset to ALL for official full document printing
    if (selectedYearFilter !== 'ALL') {
      setSelectedYearFilter('ALL');
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      window.print();
    }
  };

  const handleCopyTable = async () => {
    let text = `RINCIAN PEMBAYARAN CICILAN PINJAMAN\n`;
    text += `Nominal: ${formatRupiah(params.nominal)}\n`;
    text += `Bunga: ${params.annualRate}% / Tahun\n`;
    text += `Jangka Waktu: ${params.tenorMonths} Bulan\n\n`;
    text += `No\tBulan/Tahun\tPokok Cicilan\tBunga\tJumlah\n`;

    result.rows.forEach((r) => {
      text += `${r.no}\t${r.dateLabel}\t${formatNumberIndo(r.principal)}\t${formatNumberIndo(r.interest)}\t${formatNumberIndo(r.total)}\n`;
    });
    text += `TOTAL\t\t${formatNumberIndo(result.totalPrincipal)}\t${formatNumberIndo(result.totalInterest)}\t${formatNumberIndo(result.totalPayment)}\n`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Dynamic Styles Mapping
  const themeClasses = useMemo(() => {
    switch (tableTheme) {
      case 'executive-navy':
        return {
          containerBorder: 'border-2 border-slate-800 rounded-2xl shadow-md overflow-hidden',
          titleBanner: 'bg-slate-900 text-white font-extrabold text-center py-2.5 text-sm sm:text-base border-b-2 border-slate-800 tracking-wider uppercase',
          metaSection: 'border-b-2 border-slate-800 divide-y divide-slate-300 text-slate-900 bg-slate-50/40',
          metaDivider: 'divide-slate-300',
          metaBorderR: 'sm:border-r-2 sm:border-slate-800',
          tableHeader: 'bg-slate-900 text-white font-bold border-b-2 border-slate-800 uppercase text-[11px] sm:text-xs',
          tableHeaderCell: 'border-r border-slate-700 py-2.5 px-3',
          tableRowEven: 'bg-white',
          tableRowOdd: 'bg-slate-50/70',
          tableRowHover: 'hover:bg-indigo-50/60',
          tableCellBorder: 'border-r border-slate-300',
          tableTotalRow: 'bg-slate-900 text-white font-extrabold border-t-2 border-slate-950 text-xs sm:text-sm',
          totalCellBorder: 'border-r border-slate-700',
          badgeTiming: 'text-indigo-900 font-extrabold',
          installmentAmount: 'text-indigo-900 bg-indigo-50/60 font-extrabold',
        };
      case 'emerald-fintech':
        return {
          containerBorder: 'border-2 border-emerald-900 rounded-2xl shadow-md overflow-hidden',
          titleBanner: 'bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white font-extrabold text-center py-2.5 text-sm sm:text-base border-b-2 border-emerald-900 tracking-wider uppercase',
          metaSection: 'border-b-2 border-emerald-900 divide-y divide-emerald-200 text-slate-900 bg-emerald-50/20',
          metaDivider: 'divide-emerald-200',
          metaBorderR: 'sm:border-r-2 sm:border-emerald-900',
          tableHeader: 'bg-emerald-800 text-white font-bold border-b-2 border-emerald-900 uppercase text-[11px] sm:text-xs',
          tableHeaderCell: 'border-r border-emerald-700 py-2.5 px-3',
          tableRowEven: 'bg-white',
          tableRowOdd: 'bg-emerald-50/30',
          tableRowHover: 'hover:bg-emerald-100/50',
          tableCellBorder: 'border-r border-emerald-200',
          tableTotalRow: 'bg-emerald-900 text-white font-extrabold border-t-2 border-emerald-950 text-xs sm:text-sm',
          totalCellBorder: 'border-r border-emerald-700',
          badgeTiming: 'text-emerald-950 font-extrabold',
          installmentAmount: 'text-emerald-900 bg-emerald-100/60 font-extrabold',
        };
      case 'clean-minimal':
        return {
          containerBorder: 'border-2 border-slate-400 rounded-2xl shadow-sm overflow-hidden',
          titleBanner: 'bg-slate-100 text-slate-900 font-extrabold text-center py-2.5 text-sm sm:text-base border-b-2 border-slate-400 tracking-wider uppercase',
          metaSection: 'border-b-2 border-slate-400 divide-y divide-slate-200 text-slate-900 bg-white',
          metaDivider: 'divide-slate-200',
          metaBorderR: 'sm:border-r-2 sm:border-slate-400',
          tableHeader: 'bg-slate-800 text-white font-bold border-b-2 border-slate-400 uppercase text-[11px] sm:text-xs',
          tableHeaderCell: 'border-r border-slate-600 py-2.5 px-3',
          tableRowEven: 'bg-white',
          tableRowOdd: 'bg-slate-50',
          tableRowHover: 'hover:bg-slate-100',
          tableCellBorder: 'border-r border-slate-200',
          tableTotalRow: 'bg-slate-200 text-slate-950 font-extrabold border-t-2 border-slate-400 text-xs sm:text-sm',
          totalCellBorder: 'border-r border-slate-300',
          badgeTiming: 'text-slate-950 font-extrabold',
          installmentAmount: 'text-slate-900 bg-slate-100 font-extrabold',
        };
      case 'classic-official':
      default:
        return {
          containerBorder: 'border-2 border-black overflow-hidden',
          titleBanner: 'bg-[#FFFF00] text-black font-extrabold text-center py-2 text-sm sm:text-base border-b-2 border-black tracking-wide uppercase',
          metaSection: 'border-b-2 border-black divide-y divide-black text-black',
          metaDivider: 'divide-black',
          metaBorderR: 'sm:border-r-2 sm:border-black',
          tableHeader: 'bg-[#D32F2F] text-white font-extrabold border-b-2 border-black uppercase text-[11px] sm:text-xs tracking-wider',
          tableHeaderCell: 'border-r border-black py-2.5 px-3',
          tableRowEven: 'bg-white',
          tableRowOdd: 'bg-slate-50/60',
          tableRowHover: 'hover:bg-amber-50/50',
          tableCellBorder: 'border-r border-black',
          tableTotalRow: 'bg-[#FFFF00] text-black font-extrabold border-t-2 border-b-2 border-black text-xs sm:text-sm',
          totalCellBorder: 'border-r border-black',
          badgeTiming: 'text-black font-extrabold',
          installmentAmount: 'text-[#0047AB] bg-blue-50/40 font-extrabold',
        };
    }
  }, [tableTheme]);

  const cellPadding = density === 'compact' ? 'py-1 px-2.5' : 'py-2 px-3';

  return (
    <div className="space-y-5">
      {/* Bento Enclosure Header & Interactive Control Bar */}
      <div className="no-print bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Top Line: Header Title & Main Export Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                  Dokumen Rincian Cicilan Pinjaman
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {params.tenorMonths} Bulan
                </span>
              </div>
              {/* Subtitle removed per request */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-toggle-edit-lock"
              onClick={() => setIsEditLocked(!isEditLocked)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                isEditLocked
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
              }`}
              title={isEditLocked ? 'Mode baca saja (Terkunci)' : 'Mode edit teks aktif (Klik teks pada tabel untuk mengedit)'}
            >
              {isEditLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isEditLocked ? 'Terkunci' : 'Mode Edit Teks'}</span>
            </button>

            <button
              type="button"
              id="btn-copy-table"
              onClick={handleCopyTable}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              type="button"
              id="btn-export-csv"
              onClick={() => exportToCSV(params, result)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              id="btn-export-excel"
              onClick={() => exportToExcel(params, result)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              id="btn-print-doc"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-sm transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
              title="Cetak atau Simpan sebagai PDF via dialog cetak browser (Format A4 Resmi)"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak ke PDF</span>
            </button>
          </div>
        </div>

        {/* Bottom Line: UI Style Selector & Dynamic Customization Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* UI Style Theme Chips */}
          <div className="md:col-span-8 flex flex-wrap items-center gap-1.5">
            {UI_STYLE_OPTIONS.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setTableTheme(style.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
                  tableTheme === style.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                }`}
                title={style.desc}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${style.previewBadge}`}></span>
                <span>{style.label}</span>
              </button>
            ))}
          </div>

          {/* Density & Column Controls */}
          <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-2">
            {/* Density Toggle */}
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  density === 'compact' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Padat (Compact)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Padat</span>
              </button>
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  density === 'comfortable' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Lega (Comfortable)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lega</span>
              </button>
            </div>

            {/* Sisa Pokok Column Toggle */}
            <button
              type="button"
              id="btn-toggle-remaining-col"
              onClick={() => setShowRemainingColumn(!showRemainingColumn)}
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                showRemainingColumn
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Tampilkan kolom saldo sisa pokok pinjaman"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showRemainingColumn ? 'Sisa Pokok: On' : '+ Sisa Pokok'}</span>
            </button>

            {/* Biaya & Pencairan Toggle (if fees exist) */}
            {result.feeBreakdown && result.feeBreakdown.length > 0 && (
              <button
                type="button"
                id="btn-toggle-fees-doc"
                onClick={() => setShowFeesBreakdown(!showFeesBreakdown)}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                  showFeesBreakdown
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title="Tampilkan/sembunyikan rincian biaya potongan & pencairan bersih di dokumen"
              >
                <span>{showFeesBreakdown ? 'Biaya: On' : '+ Biaya'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Year/Period Filter (if tenor > 12 months) */}
        {availableYears.length > 1 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Filter Periode:</span>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedYearFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                  selectedYearFilter === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua ({result.rows.length} Bln)
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYearFilter(yr)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    selectedYearFilter === yr
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tahun {yr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode Edit Notice Bar */}
        {!isEditLocked && (
          <div className="flex items-center justify-between text-xs bg-amber-50/70 border border-amber-200/80 px-3.5 py-2 rounded-2xl text-amber-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold">
                Edit Table
              </span>
            </div>
            <button
              onClick={() => setIsEditLocked(true)}
              className="text-[11px] font-bold underline hover:text-amber-950 shrink-0 ml-2"
            >
              Kunci Tampilan
            </button>
          </div>
        )}
      </div>

      {/* The Bento Container framing the official document sheet */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-8">
        <div
          id="printable-loan-document"
          className="bg-white font-sans text-slate-950 max-w-4xl mx-auto"
        >
          {/* Main Document Table / Container with chosen theme borders */}
          <div className={themeClasses.containerBorder}>
            {/* Top Title Banner */}
            <div
              contentEditable={!isEditLocked}
              suppressContentEditableWarning
              onBlur={(e) => setCustomTitle(e.currentTarget.textContent || 'RINCIAN PEMBAYARAN CICILAN PINJAMAN')}
              className={`${themeClasses.titleBanner} ${
                !isEditLocked ? 'focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-text' : ''
              }`}
              title={!isEditLocked ? 'Klik untuk mengedit judul dokumen' : undefined}
            >
              {customTitle}
            </div>

            {/* Header Metadata Section */}
            <div className={`text-xs sm:text-sm font-bold ${themeClasses.metaSection}`}>
              {/* Row 1: Lender & Identitas */}
              <div className={`grid grid-cols-1 divide-y sm:divide-y-0 sm:grid-cols-2 ${themeClasses.metaDivider}`}>
                <div className={`p-2 sm:p-2.5 flex items-center ${themeClasses.metaBorderR}`}>
                  <span className="w-28 sm:w-32 uppercase shrink-0">LENDER</span>
                  <span className="mr-2">:</span>
                  <input
                    type="text"
                    disabled={isEditLocked}
                    value={params.lenderName}
                    onChange={(e) => updateParam('lenderName', e.target.value)}
                    placeholder="0"
                    className="font-extrabold bg-transparent w-full focus:outline-none focus:bg-amber-100/70 rounded px-1 -mx-1 text-slate-950 disabled:cursor-default"
                    title={!isEditLocked ? 'Klik untuk mengedit nama Lender' : undefined}
                  />
                </div>
                <div className="p-2 sm:p-2.5 flex items-center">
                  <span className="w-28 sm:w-32 uppercase shrink-0">IDENTITAS</span>
                  <span className="mr-2">:</span>
                  <input
                    type="text"
                    disabled={isEditLocked}
                    value={params.lenderIdentity}
                    onChange={(e) => updateParam('lenderIdentity', e.target.value)}
                    placeholder="0"
                    className="font-semibold bg-transparent w-full focus:outline-none focus:bg-amber-100/70 rounded px-1 -mx-1 text-slate-950 disabled:cursor-default"
                    title={!isEditLocked ? 'Klik untuk mengedit Identitas Lender' : undefined}
                  />
                </div>
              </div>

              {/* Row 2: Alamat */}
              <div className="p-2 sm:p-2.5 flex items-center">
                <span className="w-28 sm:w-32 uppercase shrink-0">ALAMAT</span>
                <span className="mr-2">:</span>
                <input
                  type="text"
                  disabled={isEditLocked}
                  value={params.lenderAddress}
                  onChange={(e) => updateParam('lenderAddress', e.target.value)}
                  placeholder="-"
                  className="font-normal bg-transparent w-full focus:outline-none focus:bg-amber-100/70 rounded px-1 -mx-1 text-slate-950 disabled:cursor-default"
                  title={!isEditLocked ? 'Klik untuk mengedit Alamat Lender' : undefined}
                />
              </div>

              {/* Row 3: Nominal, Bunga, Tenor */}
              <div className="p-2 sm:p-2.5 space-y-1 bg-slate-50/50">
                <div className="flex items-center">
                  <span className="w-44 sm:w-52 uppercase shrink-0">NOMINAL PINJAMAN</span>
                  <span className="mr-2">:</span>
                  <span className="font-extrabold text-sm sm:text-base text-slate-950">
                    {formatNumberIndo(params.nominal)}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-44 sm:w-52 uppercase shrink-0">
                    BUNGA {params.annualRate}% /ANNUAL
                  </span>
                  <span className="mr-2">:</span>
                  <span className="text-slate-700 font-semibold">
                    {formatPercent(result.monthlyRate, 3)} / bln
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-44 sm:w-52 uppercase shrink-0">JANGKA WAKTU/BULAN</span>
                  <span className="mr-2">:</span>
                  <span className="font-extrabold">{params.tenorMonths} Bulan</span>
                </div>
              </div>

              {/* Row 4: Pembayaran Dimulai */}
              <div className="p-2 sm:p-2.5 flex items-center bg-white">
                <span className="w-44 sm:w-52 uppercase shrink-0 font-extrabold">PEMBAYARAN DIMULAI</span>
                <span className="mr-2 font-extrabold">:</span>
                <input
                  type="text"
                  disabled={isEditLocked}
                  value={params.paymentTiming}
                  onChange={(e) => updateParam('paymentTiming', e.target.value)}
                  placeholder="SETIAP AKHIR BULAN"
                  className={`font-extrabold uppercase bg-transparent w-full focus:outline-none focus:bg-amber-100/70 rounded px-1 -mx-1 ${themeClasses.badgeTiming} disabled:cursor-default`}
                  title={!isEditLocked ? 'Klik untuk mengedit jadwal jatuh tempo' : undefined}
                />
                <span className={`font-extrabold uppercase shrink-0 whitespace-nowrap ml-1 ${themeClasses.badgeTiming}`}>
                  MULAI {startMonthName} {params.startYear}
                </span>
              </div>

              {/* Row 5: Cicilan Per Bulan */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${themeClasses.metaDivider} bg-white`}>
                <div className={`p-2 sm:p-2.5 flex items-center ${themeClasses.metaBorderR} font-extrabold uppercase text-xs sm:text-sm`}>
                  CICILAN PER BULAN
                </div>
                <div className={`p-2 sm:p-2.5 flex items-center justify-start sm:justify-end text-sm sm:text-base ${themeClasses.installmentAmount}`}>
                  {params.method === 'FLAT' || params.method === 'ANUITAS'
                    ? formatNumberIndo(result.monthlyInstallment)
                    : `${formatNumberIndo(result.firstMonthInstallment)} s/d ${formatNumberIndo(result.lastMonthInstallment)}`}
                </div>
              </div>

              {/* Row 6: Rincian Potongan Biaya & Pencairan Bersih (if enabled and present) */}
              {showFeesBreakdown && result.feeBreakdown && result.feeBreakdown.length > 0 && (
                <div className={`p-2 sm:p-2.5 bg-slate-50/80 space-y-1.5 border-t ${themeClasses.metaDivider}`}>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <span className="font-extrabold uppercase text-slate-800">
                      RINCIAN BIAYA AWAL ({result.feeBreakdown.length} Item):
                    </span>
                    <span className="font-bold text-rose-700">
                      Total Potongan: Rp {formatNumberIndo(result.totalFees)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {result.feeBreakdown.map((item, idx) => (
                      <span
                        key={item.fee.id || `fee-item-${idx}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 font-medium"
                      >
                        <span className="font-bold text-slate-900">{item.fee.name}:</span>
                        <span className="text-slate-800">Rp {formatNumberIndo(item.amount)}</span>
                        {item.fee.type === 'PERCENTAGE' && (
                          <span className="text-[10px] text-slate-500">({item.fee.value}%)</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-extrabold text-xs sm:text-sm">
                    <span className="uppercase text-emerald-900">
                      PENCAIRAN DANA BERSIH (DITERIMA PEMINJAM):
                    </span>
                    <span className="text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Rp {formatNumberIndo(result.netDisbursement)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse font-sans">
                <thead>
                  <tr className={themeClasses.tableHeader}>
                    <th className={`${themeClasses.tableHeaderCell} w-10 sm:w-12 text-center`}>No</th>
                    <th className={`${themeClasses.tableHeaderCell} text-center min-w-[130px]`}>
                      BULAN / TAHUN
                    </th>
                    <th className={`${themeClasses.tableHeaderCell} text-center min-w-[120px]`}>
                      POKOK CICILAN
                    </th>
                    <th className={`${themeClasses.tableHeaderCell} text-center min-w-[110px]`}>
                      BUNGA
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[120px]">
                      JUMLAH
                    </th>
                    {showRemainingColumn && (
                      <th className="py-2.5 px-3 border-l border-slate-700 text-center min-w-[120px] bg-slate-800 text-white">
                        SISA POKOK
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className={`font-semibold ${tableTheme === 'classic-official' ? 'divide-y divide-black' : 'divide-y divide-slate-200'}`}>
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={showRemainingColumn ? 6 : 5}
                        className="py-8 text-center text-slate-400 font-medium italic bg-slate-50/50"
                      >
                        Data parameter pinjaman kosong. Masukkan nominal dan tenor untuk memuat rincian angsuran.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row) => {
                      const isHovered = hoveredRowNo === row.no;
                      const paidPercentage = (((params.nominal - row.remainingPrincipal) / (params.nominal || 1)) * 100).toFixed(1);

                      return (
                        <tr
                          key={row.no}
                          onMouseEnter={() => setHoveredRowNo(row.no)}
                          onMouseLeave={() => setHoveredRowNo(null)}
                          className={`transition-colors relative ${themeClasses.tableRowHover} ${
                            row.no % 2 === 0 ? themeClasses.tableRowEven : themeClasses.tableRowOdd
                          } ${isHovered ? 'bg-amber-100/50' : ''}`}
                        >
                          <td className={`${cellPadding} text-center ${themeClasses.tableCellBorder} font-bold`}>
                            {row.no}
                          </td>
                          <td className={`${cellPadding} ${themeClasses.tableCellBorder} text-left`}>
                            <span className="inline-block w-24 sm:w-28">{row.monthName}</span>
                            <span className="font-bold">{row.year}</span>
                          </td>
                          <td className={`${cellPadding} text-right ${themeClasses.tableCellBorder} font-mono font-medium`}>
                            {formatNumberIndo(row.principal)}
                          </td>
                          <td className={`${cellPadding} text-right ${themeClasses.tableCellBorder} font-mono font-medium text-slate-800`}>
                            {formatNumberIndo(row.interest)}
                          </td>
                          <td className={`${cellPadding} text-right font-mono font-bold text-slate-950`}>
                            {formatNumberIndo(row.total)}
                          </td>
                          {showRemainingColumn && (
                            <td className={`${cellPadding} text-right ${themeClasses.tableCellBorder} font-mono text-slate-600 bg-slate-50/50`}>
                              {formatNumberIndo(row.remainingPrincipal)}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}

                  {/* Total Row */}
                  <tr className={themeClasses.tableTotalRow}>
                    <td colSpan={2} className={`${cellPadding} text-center ${themeClasses.totalCellBorder} uppercase tracking-wider font-extrabold`}>
                      JUMLAH {selectedYearFilter !== 'ALL' ? `(THN ${selectedYearFilter})` : ''}
                    </td>
                    <td className={`${cellPadding} text-right ${themeClasses.totalCellBorder} font-mono font-extrabold`}>
                      {formatNumberIndo(
                        selectedYearFilter === 'ALL'
                          ? result.totalPrincipal
                          : displayedRows.reduce((acc, r) => acc + r.principal, 0)
                      )}
                    </td>
                    <td className={`${cellPadding} text-right ${themeClasses.totalCellBorder} font-mono font-extrabold`}>
                      {formatNumberIndo(
                        selectedYearFilter === 'ALL'
                          ? result.totalInterest
                          : displayedRows.reduce((acc, r) => acc + r.interest, 0)
                      )}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-extrabold text-sm sm:text-base`}>
                      {formatNumberIndo(
                        selectedYearFilter === 'ALL'
                          ? result.totalPayment
                          : displayedRows.reduce((acc, r) => acc + r.total, 0)
                      )}
                    </td>
                    {showRemainingColumn && (
                      <td className={`${cellPadding} text-right font-mono font-extrabold`}>
                        {selectedYearFilter === 'ALL' ? '0' : '-'}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Terbilang Note (Editable) */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs italic text-slate-700 flex items-start gap-1">
            <span className="font-bold not-italic text-slate-900 shrink-0">Terbilang Total Pembayaran: </span>
            <div
              contentEditable={!isEditLocked}
              suppressContentEditableWarning
              className={`rounded px-1 -mx-1 flex-1 not-italic ${
                !isEditLocked ? 'focus:outline-none focus:bg-amber-100 cursor-text' : ''
              }`}
              title={!isEditLocked ? 'Klik untuk mengedit kalimat terbilang' : undefined}
            >
              {numberToWordsIndonesian(result.totalPayment)}
            </div>
          </div>

          {/* Formal Signature Section */}
          <div className="mt-8 pt-4 text-xs sm:text-sm font-sans avoid-page-break signature-section">
            <div className="flex justify-end mb-6 font-semibold items-center gap-1">
              <input
                type="text"
                disabled={isEditLocked}
                value={params.signCity}
                onChange={(e) => updateParam('signCity', e.target.value)}
                placeholder="Jakarta"
                className="text-right font-semibold bg-transparent focus:outline-none focus:bg-amber-100 rounded px-1 w-24 text-slate-900 disabled:cursor-default"
                title={!isEditLocked ? 'Edit Kota' : undefined}
              />
              <span>,</span>
              <input
                type="text"
                disabled={isEditLocked}
                value={params.signDateDay}
                onChange={(e) => updateParam('signDateDay', e.target.value)}
                placeholder="...."
                className="text-center font-semibold bg-transparent focus:outline-none focus:bg-amber-100 rounded px-1 w-12 text-slate-900 disabled:cursor-default"
                title={!isEditLocked ? 'Edit Tanggal (contoh: 24 atau titik-titik)' : undefined}
              />
              <input
                type="text"
                disabled={isEditLocked}
                value={params.signDateMonth}
                onChange={(e) => updateParam('signDateMonth', e.target.value)}
                placeholder="...................."
                className="text-center font-semibold bg-transparent focus:outline-none focus:bg-amber-100 rounded px-1 w-28 text-slate-900 disabled:cursor-default"
                title={!isEditLocked ? 'Edit Bulan (contoh: September)' : undefined}
              />
              <input
                type="number"
                disabled={isEditLocked}
                value={params.signDateYear}
                onChange={(e) => updateParam('signDateYear', parseInt(e.target.value) || 2026)}
                className="text-center font-semibold bg-transparent focus:outline-none focus:bg-amber-100 rounded px-1 w-16 text-slate-900 disabled:cursor-default"
                title={!isEditLocked ? 'Edit Tahun' : undefined}
              />
            </div>

            <div className="grid grid-cols-2 gap-8 items-start">
              {/* Lender Signature */}
              <div className="text-center space-y-24">
                <div
                  contentEditable={!isEditLocked}
                  suppressContentEditableWarning
                  className={`font-bold text-slate-900 rounded px-1 ${
                    !isEditLocked ? 'focus:outline-none focus:bg-amber-100 cursor-text' : ''
                  }`}
                  title={!isEditLocked ? 'Klik untuk mengedit label pemberi pinjaman' : undefined}
                >
                  Pemberi Pinjaman
                </div>
                <div className="font-extrabold underline underline-offset-4 text-slate-950">
                  <input
                    type="text"
                    disabled={isEditLocked}
                    value={params.lenderName}
                    onChange={(e) => updateParam('lenderName', e.target.value)}
                    placeholder="0"
                    className="font-extrabold text-center underline underline-offset-4 bg-transparent w-full focus:outline-none focus:bg-amber-100 rounded px-1 text-slate-950 disabled:cursor-default"
                    title={!isEditLocked ? 'Klik untuk mengedit nama penandatangan lender' : undefined}
                  />
                </div>
              </div>

              {/* Borrower Signature */}
              <div className="text-center flex flex-col justify-between h-full space-y-20">
                <div className="space-y-0.5">
                  <div
                    contentEditable={!isEditLocked}
                    suppressContentEditableWarning
                    className={`font-bold text-slate-900 rounded px-1 ${
                      !isEditLocked ? 'focus:outline-none focus:bg-amber-100 cursor-text' : ''
                    }`}
                    title={!isEditLocked ? 'Klik untuk mengedit label penerima dana' : undefined}
                  >
                    Penerima dana
                  </div>
                  <div>
                    <input
                      type="text"
                      disabled={isEditLocked}
                      value={params.borrowerTitle}
                      onChange={(e) => updateParam('borrowerTitle', e.target.value)}
                      placeholder="Jabatan"
                      className="font-medium text-center text-slate-800 text-[11px] sm:text-xs bg-transparent w-full focus:outline-none focus:bg-amber-100 rounded px-1 disabled:cursor-default"
                      title={!isEditLocked ? 'Klik untuk mengedit jabatan penerima' : undefined}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      disabled={isEditLocked}
                      value={params.borrowerOrganization}
                      onChange={(e) => updateParam('borrowerOrganization', e.target.value)}
                      placeholder="Organisasi / Perusahaan"
                      className="font-semibold text-center text-slate-900 text-[11px] sm:text-xs bg-transparent w-full focus:outline-none focus:bg-amber-100 rounded px-1 disabled:cursor-default"
                      title={!isEditLocked ? 'Klik untuk mengedit institusi / organisasi' : undefined}
                    />
                  </div>
                </div>

                <div className="font-extrabold underline underline-offset-4 text-slate-950">
                  <input
                    type="text"
                    disabled={isEditLocked}
                    value={params.borrowerName}
                    onChange={(e) => updateParam('borrowerName', e.target.value)}
                    placeholder="Nama Penerima"
                    className="font-extrabold text-center underline underline-offset-4 bg-transparent w-full focus:outline-none focus:bg-amber-100 rounded px-1 text-slate-950 disabled:cursor-default"
                    title={!isEditLocked ? 'Klik untuk mengedit nama penandatangan penerima' : undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import * as XLSX from 'xlsx';
import { LoanParams, LoanCalculationResult, InstallmentRow, InterestMethod } from '../types';

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatRupiah(amount: number, prefix: boolean = true): string {
  if (isNaN(amount)) return prefix ? 'Rp 0' : '0';
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('id-ID').format(rounded);
  return prefix ? `Rp ${formatted}` : formatted;
}

export function formatNumberIndo(amount: number): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('id-ID').format(Math.round(amount));
}

export function formatPercent(rate: number, decimals: number = 3): string {
  return (
    new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(rate) + '%'
  );
}

export function formatSignatureDate(params: LoanParams): string {
  const city = params.signCity?.trim() || 'Jakarta';
  const day = params.signDateDay?.trim();
  const month = params.signDateMonth?.trim();
  const year = params.signDateYear || 2026;

  if (day && month) {
    return `${city}, ${day} ${month} ${year}`;
  } else if (month) {
    return `${city}, ...... ${month} ${year}`;
  } else if (day) {
    return `${city}, ${day} .................... ${year}`;
  }
  return `${city}, .................... ${year}`;
}

// Convert numbers to Indonesian words (Terbilang)
export function numberToWordsIndonesian(n: number): string {
  const number = Math.floor(Math.abs(n));
  if (number === 0) return 'Nol Rupiah';

  const satuan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function convert(num: number): string {
    if (num < 12) {
      return satuan[num];
    } else if (num < 20) {
      return convert(num - 10) + ' Belas';
    } else if (num < 100) {
      return (
        convert(Math.floor(num / 10)) +
        ' Puluh ' +
        convert(num % 10)
      ).trim();
    } else if (num < 200) {
      return 'Seratus ' + convert(num - 100);
    } else if (num < 1000) {
      return (
        convert(Math.floor(num / 100)) +
        ' Ratus ' +
        convert(num % 100)
      ).trim();
    } else if (num < 2000) {
      return 'Seribu ' + convert(num - 1000);
    } else if (num < 1000000) {
      return (
        convert(Math.floor(num / 1000)) +
        ' Ribu ' +
        convert(num % 1000)
      ).trim();
    } else if (num < 1000000000) {
      return (
        convert(Math.floor(num / 1000000)) +
        ' Juta ' +
        convert(num % 1000000)
      ).trim();
    } else if (num < 1000000000000) {
      return (
        convert(Math.floor(num / 1000000000)) +
        ' Miliar ' +
        convert(num % 1000000000)
      ).trim();
    } else if (num < 1000000000000000) {
      return (
        convert(Math.floor(num / 1000000000000)) +
        ' Triliun ' +
        convert(num % 1000000000000)
      ).trim();
    }
    return '';
  }

  return convert(number).replace(/\s+/g, ' ').trim() + ' Rupiah';
}

export function calculateLoan(params: LoanParams): LoanCalculationResult {
  const { nominal, annualRate, tenorMonths, startMonth, startYear, method } = params;

  if (nominal <= 0 || tenorMonths <= 0) {
    return {
      rows: [],
      totalPrincipal: 0,
      totalInterest: 0,
      totalPayment: 0,
      monthlyInstallment: 0,
      firstMonthInstallment: 0,
      lastMonthInstallment: 0,
      monthlyRate: 0,
      effectiveRateDisplay: '0%',
    };
  }

  const monthlyRate = annualRate / 12; // in percent, e.g. 14 / 12 = 1.166667%
  const rateDecimalMonthly = annualRate / 100 / 12;
  const rows: InstallmentRow[] = [];

  let currentRemaining = nominal;

  if (method === 'FLAT') {
    // Flat Rate (Fixed Principal + Fixed Interest based on original nominal)
    // Pokok per bulan = Nominal / Tenor
    // Bunga per bulan = (Nominal * AnnualRate%) / 12
    const basePrincipalPerMonth = Math.floor(nominal / tenorMonths);
    const remainderPrincipal = nominal - basePrincipalPerMonth * tenorMonths;
    const baseInterestPerMonth = Math.round((nominal * (annualRate / 100)) / 12);

    for (let i = 1; i <= tenorMonths; i++) {
      const monthIdx = (startMonth + (i - 1)) % 12;
      const yearOffset = Math.floor((startMonth + (i - 1)) / 12);
      const rowYear = startYear + yearOffset;
      const monthName = INDONESIAN_MONTHS[monthIdx];

      // Last month absorbs rounding differences in principal
      const principal = i === tenorMonths ? basePrincipalPerMonth + remainderPrincipal : basePrincipalPerMonth;
      const interest = baseInterestPerMonth;
      const total = principal + interest;

      currentRemaining = Math.max(0, currentRemaining - principal);

      rows.push({
        no: i,
        monthName,
        year: rowYear,
        dateLabel: `${monthName} ${rowYear}`,
        principal,
        interest,
        total,
        remainingPrincipal: currentRemaining,
      });
    }
  } else if (method === 'EFEKTIF') {
    // Effective Rate (Fixed Principal, Interest based on remaining principal)
    // Pokok per bulan = Nominal / Tenor
    // Bunga per bulan = Sisa Pokok * (AnnualRate% / 12)
    const basePrincipalPerMonth = Math.floor(nominal / tenorMonths);
    const remainderPrincipal = nominal - basePrincipalPerMonth * tenorMonths;

    for (let i = 1; i <= tenorMonths; i++) {
      const monthIdx = (startMonth + (i - 1)) % 12;
      const yearOffset = Math.floor((startMonth + (i - 1)) / 12);
      const rowYear = startYear + yearOffset;
      const monthName = INDONESIAN_MONTHS[monthIdx];

      const interest = Math.round(currentRemaining * rateDecimalMonthly);
      const principal = i === tenorMonths ? basePrincipalPerMonth + remainderPrincipal : basePrincipalPerMonth;
      const total = principal + interest;

      currentRemaining = Math.max(0, currentRemaining - principal);

      rows.push({
        no: i,
        monthName,
        year: rowYear,
        dateLabel: `${monthName} ${rowYear}`,
        principal,
        interest,
        total,
        remainingPrincipal: currentRemaining,
      });
    }
  } else {
    // ANUITAS (Fixed Total Installment, Principal and Interest shift over time)
    // Angsuran = P * [ r(1+r)^n / ((1+r)^n - 1) ]
    let fixedInstallment = 0;
    if (rateDecimalMonthly === 0) {
      fixedInstallment = nominal / tenorMonths;
    } else {
      fixedInstallment =
        (nominal * (rateDecimalMonthly * Math.pow(1 + rateDecimalMonthly, tenorMonths))) /
        (Math.pow(1 + rateDecimalMonthly, tenorMonths) - 1);
    }
    const roundedInstallment = Math.round(fixedInstallment);

    for (let i = 1; i <= tenorMonths; i++) {
      const monthIdx = (startMonth + (i - 1)) % 12;
      const yearOffset = Math.floor((startMonth + (i - 1)) / 12);
      const rowYear = startYear + yearOffset;
      const monthName = INDONESIAN_MONTHS[monthIdx];

      const interest = Math.round(currentRemaining * rateDecimalMonthly);
      let principal = roundedInstallment - interest;

      if (i === tenorMonths || principal > currentRemaining) {
        principal = currentRemaining;
      }

      const total = principal + interest;
      currentRemaining = Math.max(0, currentRemaining - principal);

      rows.push({
        no: i,
        monthName,
        year: rowYear,
        dateLabel: `${monthName} ${rowYear}`,
        principal,
        interest,
        total,
        remainingPrincipal: currentRemaining,
      });
    }
  }

  const totalPrincipal = rows.reduce((sum, r) => sum + r.principal, 0);
  const totalInterest = rows.reduce((sum, r) => sum + r.interest, 0);
  const totalPayment = totalPrincipal + totalInterest;

  return {
    rows,
    totalPrincipal,
    totalInterest,
    totalPayment,
    monthlyInstallment: rows[0]?.total || 0,
    firstMonthInstallment: rows[0]?.total || 0,
    lastMonthInstallment: rows[rows.length - 1]?.total || 0,
    monthlyRate,
    effectiveRateDisplay: `${annualRate}% / Tahun (${formatPercent(monthlyRate, 3)}/bln)`,
  };
}

export function exportToExcel(params: LoanParams, result: LoanCalculationResult) {
  const wb = XLSX.utils.book_new();

  // Create Header metadata
  const headerData = [
    ['RINCIAN PEMBAYARAN CICILAN PINJAMAN'],
    [''],
    ['LENDER / PEMBERI PINJAMAN', ':', params.lenderName || '-'],
    ['IDENTITAS', ':', params.lenderIdentity || '-'],
    ['ALAMAT', ':', params.lenderAddress || '-'],
    ['NOMINAL PINJAMAN', ':', params.nominal],
    ['METODE BUNGA', ':', params.method],
    ['SUKU BUNGA / ANNUAL', ':', `${params.annualRate}% / Tahun (${formatPercent(result.monthlyRate, 3)}/bln)`],
    ['JANGKA WAKTU (BULAN)', ':', params.tenorMonths],
    ['PEMBAYARAN DIMULAI', ':', `${params.paymentTiming} MULAI ${INDONESIAN_MONTHS[params.startMonth].toUpperCase()} ${params.startYear}`],
    ['CICILAN PER BULAN', ':', result.rows[0]?.total || 0],
    [''],
    ['No', 'BULAN / TAHUN', 'POKOK CICILAN', 'BUNGA', 'JUMLAH CICILAN', 'SISA POKOK'],
  ];

  const tableRows = result.rows.map((row) => [
    row.no,
    row.dateLabel,
    row.principal,
    row.interest,
    row.total,
    row.remainingPrincipal,
  ]);

  const totalRow = [
    'TOTAL',
    '',
    result.totalPrincipal,
    result.totalInterest,
    result.totalPayment,
    0,
  ];

  const footerData = [
    [''],
    ['TERBILANG', ':', numberToWordsIndonesian(result.totalPayment)],
    [''],
    ['', '', '', formatSignatureDate(params)],
    ['Pemberi Pinjaman', '', '', 'Penerima Dana'],
    ['', '', '', params.borrowerTitle || ''],
    ['', '', '', params.borrowerOrganization || ''],
    [''],
    [''],
    ['( ' + (params.lenderName || '....................') + ' )', '', '', '( ' + (params.borrowerName || '....................') + ' )'],
  ];

  const fullData = [...headerData, ...tableRows, totalRow, ...footerData];
  const ws = XLSX.utils.aoa_to_sheet(fullData);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Rincian Pinjaman');
  XLSX.writeFile(wb, `Rincian_Cicilan_Pinjaman_${params.nominal}_${params.tenorMonths}Bulan.xlsx`);
}

export function exportToCSV(params: LoanParams, result: LoanCalculationResult) {
  let csv = `RINCIAN PEMBAYARAN CICILAN PINJAMAN\n`;
  csv += `Nominal Pinjaman: ${params.nominal}\n`;
  csv += `Bunga: ${params.annualRate}% / Tahun\n`;
  csv += `Tenor: ${params.tenorMonths} Bulan\n`;
  csv += `Metode: ${params.method}\n\n`;
  csv += `No,Bulan/Tahun,Pokok Cicilan,Bunga,Jumlah,Sisa Pokok\n`;

  result.rows.forEach((r) => {
    csv += `${r.no},"${r.dateLabel}",${r.principal},${r.interest},${r.total},${r.remainingPrincipal}\n`;
  });

  csv += `JUMLAH,,${result.totalPrincipal},${result.totalInterest},${result.totalPayment},0\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rincian_Cicilan_Pinjaman_${params.tenorMonths}Bulan.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

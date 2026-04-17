/**
 * Utility functions for exporting package statistics to CSV format
 */

export interface ExportData {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Convert array of objects to CSV format and trigger download
 */
export function downloadCSV(data: ExportData) {
  // Create CSV content
  const csvContent = [
    data.headers.join(','),
    ...data.rows.map(row => 
      row.map(cell => {
        // Escape cells that contain commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', data.filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export package realization statistics to CSV
 */
export function exportPackageStats(stats: any, dateRange: string) {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  
  const data: ExportData = {
    filename: `realisasi-paket-${timestamp}.csv`,
    headers: [
      'Metrik',
      'Nilai'
    ],
    rows: [
      ['RINGKASAN STATISTIK', ''],
      ['Tanggal Export', timestamp],
      ['Periode', dateRange],
      ['', ''],
      ['Total Terjual (Pax)', stats.totalSold || 0],
      ['Terjual Bulan Ini', stats.soldThisMonth || 0],
      ['Terjual Tahun Ini', stats.soldThisYear || 0],
      ['Total Pendapatan', stats.totalRevenue || 0],
      ['Nilai Rata-rata Booking', stats.averageBookingValue || 0],
      ['Tingkat Konversi (%)', (stats.conversionRate || 0).toFixed(2)],
      ['Total Booking', stats.totalBookings || 0],
      ['', ''],
      ['PAKET PALING LAKU', ''],
      [stats.mostPopular?.name || '-', stats.mostPopular?.count || 0],
    ]
  };

  downloadCSV(data);
}

/**
 * Export top packages detail to CSV
 */
export function exportTopPackages(packages: any[], dateRange: string) {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  
  const data: ExportData = {
    filename: `top-paket-${timestamp}.csv`,
    headers: [
      'Nama Paket',
      'Kode',
      'Pax Terjual',
      'Jumlah Booking',
      'Total Pendapatan',
      'Rata-rata per Booking'
    ],
    rows: packages.map(pkg => [
      pkg.name,
      pkg.code,
      pkg.count,
      pkg.bookingCount,
      pkg.revenue,
      (pkg.revenue / pkg.bookingCount).toFixed(0)
    ])
  };

  downloadCSV(data);
}

/**
 * Export package type breakdown to CSV
 */
export function exportPackageBreakdown(breakdown: any[], totalSold: number, dateRange: string) {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  
  const data: ExportData = {
    filename: `breakdown-kategori-${timestamp}.csv`,
    headers: [
      'Kategori Paket',
      'Total Pax',
      'Total Pendapatan',
      'Persentase (%)'
    ],
    rows: breakdown.map(item => [
      item.type,
      item.count,
      item.revenue,
      ((item.count / totalSold) * 100).toFixed(2)
    ])
  };

  downloadCSV(data);
}

/**
 * Export daily chart data to CSV
 */
export function exportDailyStats(dailyData: any[], dateRange: string) {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  
  const data: ExportData = {
    filename: `statistik-harian-${timestamp}.csv`,
    headers: [
      'Tanggal',
      'Pax',
      'Pendapatan',
      'Jumlah Booking'
    ],
    rows: dailyData.map(item => [
      item.date,
      item.pax,
      item.revenue,
      item.bookings
    ])
  };

  downloadCSV(data);
}

/**
 * Export comprehensive report combining all statistics
 */
export function exportComprehensiveReport(stats: any, dateRange: string) {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  
  const rows: (string | number)[][] = [];
  
  // Header
  rows.push(['LAPORAN REALISASI PAKET UMROH & HAJI']);
  rows.push(['Tanggal Export', timestamp]);
  rows.push(['Periode', dateRange]);
  rows.push(['']);
  
  // Summary Section
  rows.push(['RINGKASAN STATISTIK']);
  rows.push(['Total Terjual (Pax)', stats.totalSold || 0]);
  rows.push(['Terjual Bulan Ini', stats.soldThisMonth || 0]);
  rows.push(['Terjual Tahun Ini', stats.soldThisYear || 0]);
  rows.push(['Total Pendapatan', stats.totalRevenue || 0]);
  rows.push(['Nilai Rata-rata Booking', stats.averageBookingValue || 0]);
  rows.push(['Tingkat Konversi (%)', (stats.conversionRate || 0).toFixed(2)]);
  rows.push(['Total Booking', stats.totalBookings || 0]);
  rows.push(['']);
  
  // Most Popular Package
  rows.push(['PAKET PALING LAKU']);
  rows.push(['Nama', stats.mostPopular?.name || '-']);
  rows.push(['Pax Terjual', stats.mostPopular?.count || 0]);
  rows.push(['']);
  
  // Top Packages
  rows.push(['TOP 5 PAKET']);
  rows.push(['Nama Paket', 'Kode', 'Pax Terjual', 'Booking', 'Pendapatan', 'Rata-rata']);
  if (stats.topPackages && stats.topPackages.length > 0) {
    stats.topPackages.forEach((pkg: any) => {
      rows.push([
        pkg.name,
        pkg.code,
        pkg.count,
        pkg.bookingCount,
        pkg.revenue,
        (pkg.revenue / pkg.bookingCount).toFixed(0)
      ]);
    });
  }
  rows.push(['']);
  
  // Package Type Breakdown
  rows.push(['BREAKDOWN KATEGORI PAKET']);
  rows.push(['Kategori', 'Pax', 'Pendapatan', 'Persentase (%)']);
  if (stats.packageTypeBreakdown && stats.packageTypeBreakdown.length > 0) {
    stats.packageTypeBreakdown.forEach((item: any) => {
      rows.push([
        item.type,
        item.count,
        item.revenue,
        ((item.count / (stats.totalSold || 1)) * 100).toFixed(2)
      ]);
    });
  }
  
  const data: ExportData = {
    filename: `laporan-realisasi-${timestamp}.csv`,
    headers: ['LAPORAN REALISASI PAKET'],
    rows
  };

  downloadCSV(data);
}

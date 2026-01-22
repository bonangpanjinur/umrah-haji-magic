import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Company info interface
interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}

// Letter data interfaces
interface LeaveLetterData {
  employeeName: string;
  employeePosition: string;
  employeeNik: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  destination?: string;
}

interface PassportLetterData {
  customerName: string;
  nik: string;
  birthPlace: string;
  birthDate: Date;
  address: string;
  phone: string;
  purpose: string;
  departureDate?: Date;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  customer: {
    name: string;
    address: string;
    phone: string;
    email?: string;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  notes?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

interface GeneralLetterData {
  letterNumber: string;
  letterDate: Date;
  recipient: {
    name: string;
    position?: string;
    institution?: string;
    address?: string;
  };
  subject: string;
  content: string;
  signatory: {
    name: string;
    position: string;
  };
}

const defaultCompanyInfo: CompanyInfo = {
  name: 'PT. Umrah Haji Travel',
  address: 'Jl. Raya Utama No. 123, Jakarta Selatan 12345',
  phone: '(021) 1234-5678',
  email: 'info@umrahhaji.com',
  website: 'www.umrahhaji.com'
};

// Helper to add letterhead
function addLetterhead(doc: jsPDF, company: CompanyInfo = defaultCompanyInfo) {
  const pageWidth = doc.internal.pageSize.width;
  
  // Company name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, pageWidth / 2, 20, { align: 'center' });
  
  // Company details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(company.address, pageWidth / 2, 27, { align: 'center' });
  doc.text(`Telp: ${company.phone} | Email: ${company.email}`, pageWidth / 2, 33, { align: 'center' });
  if (company.website) {
    doc.text(company.website, pageWidth / 2, 39, { align: 'center' });
  }
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(14, 45, pageWidth - 14, 45);
  doc.setLineWidth(0.2);
  doc.line(14, 46, pageWidth - 14, 46);
  
  return 55; // Return starting Y position for content
}

// Helper to add footer
function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(
    `Dicetak pada: ${format(new Date(), 'd MMMM yyyy HH:mm', { locale: id })}`,
    14,
    pageHeight - 10
  );
  doc.text(
    `Halaman ${pageNum} dari ${totalPages}`,
    pageWidth - 14,
    pageHeight - 10,
    { align: 'right' }
  );
  doc.setTextColor(0);
}

// Generate Leave Letter (Surat Cuti)
export function generateLeaveLetter(
  data: LeaveLetterData,
  letterNumber: string,
  company: CompanyInfo = defaultCompanyInfo
): jsPDF {
  const doc = new jsPDF();
  let y = addLetterhead(doc, company);
  
  const pageWidth = doc.internal.pageSize.width;
  
  // Letter number and date
  doc.setFontSize(11);
  doc.text(`Nomor: ${letterNumber}`, pageWidth - 14, y, { align: 'right' });
  y += 6;
  doc.text(`Tanggal: ${format(new Date(), 'd MMMM yyyy', { locale: id })}`, pageWidth - 14, y, { align: 'right' });
  y += 6;
  doc.text('Lampiran: -', pageWidth - 14, y, { align: 'right' });
  y += 6;
  doc.text('Perihal: Permohonan Cuti', pageWidth - 14, y, { align: 'right' });
  
  y += 15;
  
  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SURAT PERMOHONAN CUTI', pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // Content
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const content = `Yang bertanda tangan di bawah ini:

Nama                : ${data.employeeName}
NIK/NIP            : ${data.employeeNik}
Jabatan            : ${data.employeePosition}

Dengan ini mengajukan permohonan cuti kerja terhitung mulai:

Tanggal Mulai      : ${format(data.startDate, 'd MMMM yyyy', { locale: id })}
Tanggal Selesai    : ${format(data.endDate, 'd MMMM yyyy', { locale: id })}
Alasan Cuti        : ${data.reason}${data.destination ? `\nTujuan/Alamat      : ${data.destination}` : ''}

Demikian surat permohonan cuti ini saya ajukan. Atas perhatian dan persetujuan Bapak/Ibu, saya ucapkan terima kasih.`;

  const lines = doc.splitTextToSize(content, pageWidth - 28);
  doc.text(lines, 14, y);
  
  y += lines.length * 6 + 20;
  
  // Signature
  doc.text(`Jakarta, ${format(new Date(), 'd MMMM yyyy', { locale: id })}`, pageWidth - 60, y);
  y += 6;
  doc.text('Hormat saya,', pageWidth - 60, y);
  y += 25;
  doc.setFont('helvetica', 'bold');
  doc.text(data.employeeName, pageWidth - 60, y);
  
  // Approval section
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.text('Disetujui oleh:', 14, y);
  y += 25;
  doc.text('_______________________', 14, y);
  y += 5;
  doc.text('Atasan Langsung', 14, y);
  
  addFooter(doc, 1, 1);
  
  return doc;
}

// Generate Passport Request Letter (Surat Permohonan Paspor)
export function generatePassportLetter(
  data: PassportLetterData,
  letterNumber: string,
  company: CompanyInfo = defaultCompanyInfo
): jsPDF {
  const doc = new jsPDF();
  let y = addLetterhead(doc, company);
  
  const pageWidth = doc.internal.pageSize.width;
  
  // Letter number and date
  doc.setFontSize(11);
  doc.text(`Nomor: ${letterNumber}`, 14, y);
  y += 6;
  doc.text(`Tanggal: ${format(new Date(), 'd MMMM yyyy', { locale: id })}`, 14, y);
  y += 6;
  doc.text('Lampiran: Fotokopi KTP, KK, Akta Lahir', 14, y);
  y += 6;
  doc.text('Perihal: Permohonan Pembuatan Paspor', 14, y);
  
  y += 12;
  
  // Recipient
  doc.text('Kepada Yth.', 14, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala Kantor Imigrasi', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('di Tempat', 14, y);
  
  y += 15;
  
  // Content
  const content = `Dengan hormat,

Yang bertanda tangan di bawah ini, Direktur ${company.name}, dengan ini mengajukan permohonan pembuatan paspor untuk keperluan perjalanan ibadah Umrah/Haji atas nama:

Nama Lengkap       : ${data.customerName}
NIK                : ${data.nik}
Tempat/Tgl Lahir   : ${data.birthPlace}, ${format(data.birthDate, 'd MMMM yyyy', { locale: id })}
Alamat             : ${data.address}
No. Telepon        : ${data.phone}
Tujuan Perjalanan  : ${data.purpose}${data.departureDate ? `\nRencana Berangkat  : ${format(data.departureDate, 'd MMMM yyyy', { locale: id })}` : ''}

Yang bersangkutan adalah calon jamaah yang telah terdaftar di ${company.name} dan memerlukan paspor untuk keperluan perjalanan ibadah ke Tanah Suci.

Bersama ini kami lampirkan dokumen pendukung:
1. Fotokopi KTP
2. Fotokopi Kartu Keluarga
3. Fotokopi Akta Kelahiran
4. Pas Foto 4x6 (latar belakang putih)

Demikian surat permohonan ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.`;

  const lines = doc.splitTextToSize(content, pageWidth - 28);
  doc.text(lines, 14, y);
  
  y += lines.length * 5 + 20;
  
  // Signature
  doc.text(`Jakarta, ${format(new Date(), 'd MMMM yyyy', { locale: id })}`, pageWidth - 70, y);
  y += 6;
  doc.text('Hormat kami,', pageWidth - 70, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, pageWidth - 70, y);
  y += 25;
  doc.text('___________________', pageWidth - 70, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('Direktur', pageWidth - 70, y);
  
  addFooter(doc, 1, 1);
  
  return doc;
}

// Generate Invoice
export function generateInvoice(
  data: InvoiceData,
  company: CompanyInfo = defaultCompanyInfo
): jsPDF {
  const doc = new jsPDF();
  let y = addLetterhead(doc, company);
  
  const pageWidth = doc.internal.pageSize.width;
  
  // Invoice Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // Invoice details (left) and Customer (right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Left side - Invoice info
  doc.text(`No. Invoice: ${data.invoiceNumber}`, 14, y);
  doc.text(`Tanggal: ${format(data.invoiceDate, 'd MMMM yyyy', { locale: id })}`, 14, y + 6);
  doc.text(`Jatuh Tempo: ${format(data.dueDate, 'd MMMM yyyy', { locale: id })}`, 14, y + 12);
  
  // Right side - Customer info
  doc.setFont('helvetica', 'bold');
  doc.text('Kepada:', pageWidth - 80, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customer.name, pageWidth - 80, y + 6);
  const addressLines = doc.splitTextToSize(data.customer.address, 65);
  doc.text(addressLines, pageWidth - 80, y + 12);
  doc.text(`Telp: ${data.customer.phone}`, pageWidth - 80, y + 12 + addressLines.length * 5);
  
  y += 35;
  
  // Items table
  const tableData = data.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.total)
  ]);
  
  autoTable(doc, {
    startY: y,
    head: [['No', 'Deskripsi', 'Qty', 'Harga Satuan', 'Total']],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    }
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals
  const totalsX = pageWidth - 80;
  doc.text('Subtotal:', totalsX, y);
  doc.text(formatCurrency(data.subtotal), pageWidth - 14, y, { align: 'right' });
  y += 6;
  
  if (data.discount) {
    doc.text('Diskon:', totalsX, y);
    doc.text(`-${formatCurrency(data.discount)}`, pageWidth - 14, y, { align: 'right' });
    y += 6;
  }
  
  if (data.tax) {
    doc.text('PPN (11%):', totalsX, y);
    doc.text(formatCurrency(data.tax), pageWidth - 14, y, { align: 'right' });
    y += 6;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, y + 3);
  doc.text(formatCurrency(data.total), pageWidth - 14, y + 3, { align: 'right' });
  
  y += 20;
  
  // Bank info
  if (data.bankInfo) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Pembayaran dapat ditransfer ke:', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${data.bankInfo.bankName}`, 14, y);
    y += 5;
    doc.text(`No. Rekening: ${data.bankInfo.accountNumber}`, 14, y);
    y += 5;
    doc.text(`Atas Nama: ${data.bankInfo.accountName}`, 14, y);
  }
  
  // Notes
  if (data.notes) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Catatan:', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - 28);
    doc.text(noteLines, 14, y);
  }
  
  addFooter(doc, 1, 1);
  
  return doc;
}

// Generate General Letter (Surat Umum)
export function generateGeneralLetter(
  data: GeneralLetterData,
  company: CompanyInfo = defaultCompanyInfo
): jsPDF {
  const doc = new jsPDF();
  let y = addLetterhead(doc, company);
  
  const pageWidth = doc.internal.pageSize.width;
  
  // Letter number and date
  doc.setFontSize(11);
  doc.text(`Nomor: ${data.letterNumber}`, 14, y);
  y += 6;
  doc.text(`Tanggal: ${format(data.letterDate, 'd MMMM yyyy', { locale: id })}`, 14, y);
  y += 6;
  doc.text('Lampiran: -', 14, y);
  y += 6;
  doc.text(`Perihal: ${data.subject}`, 14, y);
  
  y += 12;
  
  // Recipient
  doc.text('Kepada Yth.', 14, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(data.recipient.name, 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  if (data.recipient.position) {
    doc.text(data.recipient.position, 14, y);
    y += 6;
  }
  if (data.recipient.institution) {
    doc.text(data.recipient.institution, 14, y);
    y += 6;
  }
  if (data.recipient.address) {
    doc.text(`di ${data.recipient.address}`, 14, y);
    y += 6;
  }
  
  y += 10;
  
  // Content
  doc.text('Dengan hormat,', 14, y);
  y += 8;
  
  const contentLines = doc.splitTextToSize(data.content, pageWidth - 28);
  doc.text(contentLines, 14, y);
  
  y += contentLines.length * 5 + 10;
  
  doc.text('Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.', 14, y);
  
  y += 20;
  
  // Signature
  doc.text(`Jakarta, ${format(data.letterDate, 'd MMMM yyyy', { locale: id })}`, pageWidth - 70, y);
  y += 6;
  doc.text('Hormat kami,', pageWidth - 70, y);
  y += 25;
  doc.setFont('helvetica', 'bold');
  doc.text(data.signatory.name, pageWidth - 70, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(data.signatory.position, pageWidth - 70, y);
  
  addFooter(doc, 1, 1);
  
  return doc;
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Export types for external use
export type {
  CompanyInfo,
  LeaveLetterData,
  PassportLetterData,
  InvoiceData,
  GeneralLetterData
};

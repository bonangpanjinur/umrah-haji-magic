import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  FileText, 
  Download, 
  Send, 
  Calendar as CalendarIcon,
  Plane,
  Receipt,
  Mail,
  User,
  Users,
  Briefcase,
  Ticket,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateLeaveLetter,
  generateJamaahLeaveLetter,
  generatePassportLetter,
  generateInvoice,
  generateGeneralLetter,
  generateETicket,
  generateUmrahCertificate,
  type LeaveLetterData,
  type JamaahLeaveLetterData,
  type PassportLetterData,
  type InvoiceData,
  type GeneralLetterData,
  type ETicketData,
  type UmrahCertificateData
} from '@/lib/document-generator';

interface Employee {
  id: string;
  full_name: string;
  employee_id: string;
  position: string;
  department: string;
  status: string;
}

const AdminDocumentGenerator = () => {
  const [activeTab, setActiveTab] = useState('jamaah-leave');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [currentPdfBlob, setCurrentPdfBlob] = useState<Blob | null>(null);
  const [currentFileName, setCurrentFileName] = useState('');

  // Employee Leave letter form state
  const [employeeLeaveForm, setEmployeeLeaveForm] = useState({
    employeeId: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: '',
    destination: ''
  });

  // Jamaah Leave letter form state
  const [jamaahLeaveForm, setJamaahLeaveForm] = useState({
    customerId: '',
    employerName: '',
    employerPosition: '',
    employerInstitution: '',
    employerAddress: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    purpose: 'Ibadah Umrah'
  });

  // Passport letter form state
  const [passportForm, setPassportForm] = useState({
    customerId: '',
    purpose: 'Ibadah Umrah',
    departureDate: undefined as Date | undefined
  });

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    bookingId: '',
    dueDate: undefined as Date | undefined,
    notes: ''
  });

  // General letter form state
  const [generalForm, setGeneralForm] = useState({
    recipientName: '',
    recipientPosition: '',
    recipientInstitution: '',
    recipientAddress: '',
    subject: '',
    content: '',
    signatoryName: '',
    signatoryPosition: ''
  });

  // E-Ticket form state
  const [eticketForm, setEticketForm] = useState({
    bookingId: ''
  });

  // Certificate form state
  const [certificateForm, setCertificateForm] = useState({
    bookingId: ''
  });

  // Fetch employees for employee leave letter
  const { data: employees } = useQuery<Employee[]>({
    queryKey: ['employees-for-letter'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_employees' as any).select('*');
      if (error) {
        const result = await supabase
          .from('employees' as any)
          .select('id, full_name, employee_id, position, department, status')
          .eq('status', 'active')
          .order('full_name') as { data: Employee[] | null; error: any };
        return result.data || [];
      }
      return (data as unknown as Employee[]) || [];
    }
  });

  // Fetch customers for jamaah letters
  const { data: customers } = useQuery({
    queryKey: ['customers-for-letter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('full_name')
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  // Fetch bookings for invoice, e-ticket, certificate
  const { data: bookings } = useQuery({
    queryKey: ['bookings-for-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(id, full_name, address, phone, email, nik, birth_place, birth_date, passport_number),
          departure:departures(
            departure_date,
            return_date,
            departure_time,
            flight_number,
            airline:airlines(name, code),
            departure_airport:airports!departures_departure_airport_id_fkey(name, city, code),
            arrival_airport:airports!departures_arrival_airport_id_fkey(name, city, code),
            hotel_makkah:hotels!departures_hotel_makkah_id_fkey(name),
            hotel_madinah:hotels!departures_hotel_madinah_id_fkey(name),
            package:packages(name, price_quad, price_triple, price_double, price_single)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  const generateLetterNumber = (prefix: string) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${random}/${prefix}/UHT/${month}/${year}`;
  };

  const handleDownloadPdf = (doc: any, filename: string) => {
    doc.save(`${filename}.pdf`);
    toast.success('Dokumen berhasil diunduh');
  };

  const handlePrepareSend = (doc: any, filename: string) => {
    const blob = doc.output('blob');
    setCurrentPdfBlob(blob);
    setCurrentFileName(filename);
    setSendDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!sendEmail || !currentPdfBlob) {
      toast.error('Email tujuan harus diisi');
      return;
    }
    toast.success(`Dokumen akan dikirim ke ${sendEmail}`);
    setSendDialogOpen(false);
    setSendEmail('');
    
    const url = URL.createObjectURL(currentPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFileName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Employee Leave Letter
  const handleGenerateEmployeeLeaveLetter = () => {
    const employee = employees?.find(e => e.id === employeeLeaveForm.employeeId);
    if (!employee || !employeeLeaveForm.startDate || !employeeLeaveForm.endDate) {
      toast.error('Lengkapi semua data yang diperlukan');
      return;
    }

    const data: LeaveLetterData = {
      employeeName: employee.full_name,
      employeePosition: employee.position || 'Staff',
      employeeNik: employee.employee_id || '-',
      startDate: employeeLeaveForm.startDate,
      endDate: employeeLeaveForm.endDate,
      reason: employeeLeaveForm.reason,
      destination: employeeLeaveForm.destination
    };

    const doc = generateLeaveLetter(data, generateLetterNumber('CUTI-KRY'));
    return doc;
  };

  // Handle Jamaah Leave Letter
  const handleGenerateJamaahLeaveLetter = () => {
    const customer = customers?.find(c => c.id === jamaahLeaveForm.customerId);
    if (!customer || !jamaahLeaveForm.startDate || !jamaahLeaveForm.endDate || !jamaahLeaveForm.employerName) {
      toast.error('Lengkapi semua data yang diperlukan (Jamaah, Tanggal, dan Data Pemberi Kerja)');
      return;
    }

    const data: JamaahLeaveLetterData = {
      jamaahName: customer.full_name,
      nik: customer.nik || '-',
      birthPlace: customer.birth_place || '-',
      birthDate: customer.birth_date ? new Date(customer.birth_date) : new Date(),
      address: customer.address || '-',
      employerName: jamaahLeaveForm.employerName,
      employerPosition: jamaahLeaveForm.employerPosition,
      employerInstitution: jamaahLeaveForm.employerInstitution,
      employerAddress: jamaahLeaveForm.employerAddress,
      startDate: jamaahLeaveForm.startDate,
      endDate: jamaahLeaveForm.endDate,
      purpose: jamaahLeaveForm.purpose
    };

    const doc = generateJamaahLeaveLetter(data, generateLetterNumber('CUTI-JMH'));
    return doc;
  };

  const handleGeneratePassportLetter = () => {
    const customer = customers?.find(c => c.id === passportForm.customerId);
    if (!customer) {
      toast.error('Pilih jamaah terlebih dahulu');
      return;
    }

    const data: PassportLetterData = {
      customerName: customer.full_name,
      nik: customer.nik || '-',
      birthPlace: customer.birth_place || '-',
      birthDate: customer.birth_date ? new Date(customer.birth_date) : new Date(),
      address: customer.address || '-',
      phone: customer.phone || '-',
      purpose: passportForm.purpose,
      departureDate: passportForm.departureDate
    };

    const doc = generatePassportLetter(data, generateLetterNumber('PASPOR'));
    return doc;
  };

  const handleGenerateInvoice = () => {
    const booking = bookings?.find(b => b.id === invoiceForm.bookingId);
    if (!booking) {
      toast.error('Pilih booking terlebih dahulu');
      return;
    }

    const customer = booking.customer as any;
    const departure = booking.departure as any;
    const pkg = departure?.package as any;

    const data: InvoiceData = {
      invoiceNumber: `INV-${booking.booking_code}`,
      invoiceDate: new Date(),
      dueDate: invoiceForm.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      customer: {
        name: customer?.full_name || '-',
        address: customer?.address || '-',
        phone: customer?.phone || '-',
        email: customer?.email
      },
      items: [
        {
          description: `Paket ${pkg?.name || 'Umrah'} - ${booking.room_type}`,
          quantity: booking.total_pax || 1,
          unitPrice: booking.base_price / (booking.total_pax || 1),
          total: booking.base_price
        }
      ],
      subtotal: booking.base_price,
      discount: booking.discount_amount || 0,
      total: booking.total_price,
      notes: invoiceForm.notes || 'Pembayaran dapat dilakukan secara bertahap. Pelunasan paling lambat 2 minggu sebelum keberangkatan.',
      bankInfo: {
        bankName: 'Bank Syariah Indonesia (BSI)',
        accountNumber: '1234567890',
        accountName: 'PT. Umrah Haji Travel'
      }
    };

    const doc = generateInvoice(data);
    return doc;
  };

  const handleGenerateGeneralLetter = () => {
    if (!generalForm.recipientName || !generalForm.subject || !generalForm.content) {
      toast.error('Lengkapi semua data yang diperlukan');
      return;
    }

    const data: GeneralLetterData = {
      letterNumber: generateLetterNumber('SURAT'),
      letterDate: new Date(),
      recipient: {
        name: generalForm.recipientName,
        position: generalForm.recipientPosition,
        institution: generalForm.recipientInstitution,
        address: generalForm.recipientAddress
      },
      subject: generalForm.subject,
      content: generalForm.content,
      signatory: {
        name: generalForm.signatoryName || 'Direktur Utama',
        position: generalForm.signatoryPosition || 'PT. Umrah Haji Travel'
      }
    };

    const doc = generateGeneralLetter(data);
    return doc;
  };

  // Handle E-Ticket Generation
  const handleGenerateETicket = () => {
    const booking = bookings?.find(b => b.id === eticketForm.bookingId);
    if (!booking) {
      toast.error('Pilih booking terlebih dahulu');
      return;
    }

    const customer = booking.customer as any;
    const departure = booking.departure as any;
    const pkg = departure?.package as any;
    const airline = departure?.airline as any;
    const depAirport = departure?.departure_airport as any;
    const arrAirport = departure?.arrival_airport as any;
    const hotelMakkah = departure?.hotel_makkah as any;
    const hotelMadinah = departure?.hotel_madinah as any;

    const roomTypeLabels: Record<string, string> = {
      quad: 'Quad (4 orang)',
      triple: 'Triple (3 orang)',
      double: 'Double (2 orang)',
      single: 'Single (1 orang)'
    };

    const data: ETicketData = {
      bookingCode: booking.booking_code,
      passengerName: customer?.full_name || '-',
      passportNumber: customer?.passport_number || '-',
      packageName: pkg?.name || 'Paket Umrah',
      departureDate: new Date(departure?.departure_date),
      returnDate: new Date(departure?.return_date),
      departureAirport: depAirport ? `${depAirport.name} (${depAirport.code})` : '-',
      arrivalAirport: arrAirport ? `${arrAirport.name} (${arrAirport.code})` : '-',
      flightNumber: departure?.flight_number,
      airline: airline?.name,
      departureTime: departure?.departure_time,
      hotelMakkah: hotelMakkah?.name,
      hotelMadinah: hotelMadinah?.name,
      roomType: roomTypeLabels[booking.room_type] || booking.room_type
    };

    const doc = generateETicket(data);
    return doc;
  };

  // Handle Umrah Certificate Generation
  const handleGenerateCertificate = () => {
    const booking = bookings?.find(b => b.id === certificateForm.bookingId);
    if (!booking) {
      toast.error('Pilih booking terlebih dahulu');
      return;
    }

    const customer = booking.customer as any;
    const departure = booking.departure as any;
    const pkg = departure?.package as any;

    const data: UmrahCertificateData = {
      participantName: customer?.full_name || '-',
      passportNumber: customer?.passport_number || '-',
      birthPlace: customer?.birth_place || '-',
      birthDate: customer?.birth_date ? new Date(customer.birth_date) : new Date(),
      packageName: pkg?.name || 'Paket Umrah',
      departureDate: new Date(departure?.departure_date),
      returnDate: new Date(departure?.return_date),
      certificateNumber: `CERT-${booking.booking_code}`
    };

    const doc = generateUmrahCertificate(data);
    return doc;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Dokumen</h1>
        <p className="text-muted-foreground">Buat surat-surat resmi dan invoice dalam format PDF</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="jamaah-leave" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden lg:inline">Cuti Jamaah</span>
          </TabsTrigger>
          <TabsTrigger value="employee-leave" className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span className="hidden lg:inline">Cuti Karyawan</span>
          </TabsTrigger>
          <TabsTrigger value="passport" className="flex items-center gap-1">
            <Plane className="h-4 w-4" />
            <span className="hidden lg:inline">Paspor</span>
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center gap-1">
            <Receipt className="h-4 w-4" />
            <span className="hidden lg:inline">Invoice</span>
          </TabsTrigger>
          <TabsTrigger value="eticket" className="flex items-center gap-1">
            <Ticket className="h-4 w-4" />
            <span className="hidden lg:inline">E-Ticket</span>
          </TabsTrigger>
          <TabsTrigger value="certificate" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span className="hidden lg:inline">Sertifikat</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden lg:inline">Surat Umum</span>
          </TabsTrigger>
        </TabsList>

        {/* Jamaah Leave Letter Tab */}
        <TabsContent value="jamaah-leave">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Surat Keterangan Cuti Jamaah
              </CardTitle>
              <CardDescription>
                Generate surat keterangan untuk izin cuti jamaah dari tempat kerja untuk menunaikan ibadah Umrah/Haji
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data Jamaah */}
                <div className="col-span-2">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">DATA JAMAAH</h3>
                </div>
                
                <div className="space-y-2">
                  <Label>Jamaah</Label>
                  <Select
                    value={jamaahLeaveForm.customerId}
                    onValueChange={(value) => setJamaahLeaveForm({ ...jamaahLeaveForm, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jamaah" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((cust) => (
                        <SelectItem key={cust.id} value={cust.id}>
                          {cust.full_name} - {cust.nik || 'NIK belum diisi'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tujuan Ibadah</Label>
                  <Select
                    value={jamaahLeaveForm.purpose}
                    onValueChange={(value) => setJamaahLeaveForm({ ...jamaahLeaveForm, purpose: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ibadah Umrah">Ibadah Umrah</SelectItem>
                      <SelectItem value="Ibadah Haji">Ibadah Haji</SelectItem>
                      <SelectItem value="Ibadah Umrah dan Haji">Ibadah Umrah dan Haji</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Berangkat</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !jamaahLeaveForm.startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {jamaahLeaveForm.startDate ? format(jamaahLeaveForm.startDate, "PPP", { locale: id }) : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={jamaahLeaveForm.startDate}
                        onSelect={(date) => setJamaahLeaveForm({ ...jamaahLeaveForm, startDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Kembali</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !jamaahLeaveForm.endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {jamaahLeaveForm.endDate ? format(jamaahLeaveForm.endDate, "PPP", { locale: id }) : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={jamaahLeaveForm.endDate}
                        onSelect={(date) => setJamaahLeaveForm({ ...jamaahLeaveForm, endDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Data Pemberi Kerja */}
                <div className="col-span-2 pt-4">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">DATA PENERIMA SURAT (PEMBERI KERJA)</h3>
                </div>

                <div className="space-y-2">
                  <Label>Nama Pimpinan/HRD</Label>
                  <Input
                    value={jamaahLeaveForm.employerName}
                    onChange={(e) => setJamaahLeaveForm({ ...jamaahLeaveForm, employerName: e.target.value })}
                    placeholder="Nama penerima surat"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jabatan (Opsional)</Label>
                  <Input
                    value={jamaahLeaveForm.employerPosition}
                    onChange={(e) => setJamaahLeaveForm({ ...jamaahLeaveForm, employerPosition: e.target.value })}
                    placeholder="Contoh: Kepala HRD"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nama Instansi/Perusahaan</Label>
                  <Input
                    value={jamaahLeaveForm.employerInstitution}
                    onChange={(e) => setJamaahLeaveForm({ ...jamaahLeaveForm, employerInstitution: e.target.value })}
                    placeholder="Nama perusahaan/instansi"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alamat Instansi</Label>
                  <Input
                    value={jamaahLeaveForm.employerAddress}
                    onChange={(e) => setJamaahLeaveForm({ ...jamaahLeaveForm, employerAddress: e.target.value })}
                    placeholder="Alamat perusahaan/instansi"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  const doc = handleGenerateJamaahLeaveLetter();
                  if (doc) {
                    const customer = customers?.find(c => c.id === jamaahLeaveForm.customerId);
                    handleDownloadPdf(doc, `surat-cuti-jamaah-${customer?.full_name?.replace(/\s+/g, '-').toLowerCase() || 'new'}`);
                  }
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => {
                  const doc = handleGenerateJamaahLeaveLetter();
                  if (doc) {
                    const customer = customers?.find(c => c.id === jamaahLeaveForm.customerId);
                    handlePrepareSend(doc, `surat-cuti-jamaah-${customer?.full_name?.replace(/\s+/g, '-').toLowerCase() || 'new'}`);
                  }
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim via Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Leave Letter Tab */}
        <TabsContent value="employee-leave">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Surat Permohonan Cuti Karyawan
              </CardTitle>
              <CardDescription>Generate surat cuti untuk karyawan internal perusahaan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Karyawan</Label>
                  <Select
                    value={employeeLeaveForm.employeeId}
                    onValueChange={(value) => setEmployeeLeaveForm({ ...employeeLeaveForm, employeeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih karyawan" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} - {emp.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alasan Cuti</Label>
                  <Input
                    value={employeeLeaveForm.reason}
                    onChange={(e) => setEmployeeLeaveForm({ ...employeeLeaveForm, reason: e.target.value })}
                    placeholder="Contoh: Keperluan keluarga"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !employeeLeaveForm.startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {employeeLeaveForm.startDate ? format(employeeLeaveForm.startDate, "PPP", { locale: id }) : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={employeeLeaveForm.startDate}
                        onSelect={(date) => setEmployeeLeaveForm({ ...employeeLeaveForm, startDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !employeeLeaveForm.endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {employeeLeaveForm.endDate ? format(employeeLeaveForm.endDate, "PPP", { locale: id }) : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={employeeLeaveForm.endDate}
                        onSelect={(date) => setEmployeeLeaveForm({ ...employeeLeaveForm, endDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Alamat Selama Cuti (Opsional)</Label>
                  <Input
                    value={employeeLeaveForm.destination}
                    onChange={(e) => setEmployeeLeaveForm({ ...employeeLeaveForm, destination: e.target.value })}
                    placeholder="Alamat tujuan selama cuti"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  const doc = handleGenerateEmployeeLeaveLetter();
                  if (doc) handleDownloadPdf(doc, `surat-cuti-karyawan-${employeeLeaveForm.employeeId}`);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => {
                  const doc = handleGenerateEmployeeLeaveLetter();
                  if (doc) handlePrepareSend(doc, `surat-cuti-karyawan-${employeeLeaveForm.employeeId}`);
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim via Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passport Letter Tab */}
        <TabsContent value="passport">
          <Card>
            <CardHeader>
              <CardTitle>Surat Permohonan Paspor</CardTitle>
              <CardDescription>Generate surat pengantar pembuatan paspor ke imigrasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jamaah</Label>
                  <Select
                    value={passportForm.customerId}
                    onValueChange={(value) => setPassportForm({ ...passportForm, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jamaah" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((cust) => (
                        <SelectItem key={cust.id} value={cust.id}>
                          {cust.full_name} - {cust.nik || 'NIK belum diisi'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tujuan Perjalanan</Label>
                  <Select
                    value={passportForm.purpose}
                    onValueChange={(value) => setPassportForm({ ...passportForm, purpose: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ibadah Umrah">Ibadah Umrah</SelectItem>
                      <SelectItem value="Ibadah Haji">Ibadah Haji</SelectItem>
                      <SelectItem value="Ibadah Umrah dan Haji">Ibadah Umrah dan Haji</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rencana Keberangkatan (Opsional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !passportForm.departureDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {passportForm.departureDate ? format(passportForm.departureDate, "PPP", { locale: id }) : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={passportForm.departureDate}
                        onSelect={(date) => setPassportForm({ ...passportForm, departureDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  const doc = handleGeneratePassportLetter();
                  if (doc) handleDownloadPdf(doc, `surat-paspor-${passportForm.customerId}`);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => {
                  const doc = handleGeneratePassportLetter();
                  if (doc) handlePrepareSend(doc, `surat-paspor-${passportForm.customerId}`);
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim via Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Tab */}
        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Pembayaran</CardTitle>
              <CardDescription>Generate invoice untuk booking jamaah</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Booking</Label>
                  <Select
                    value={invoiceForm.bookingId}
                    onValueChange={(value) => setInvoiceForm({ ...invoiceForm, bookingId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih booking" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings?.map((booking) => {
                        const customer = booking.customer as any;
                        return (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.booking_code} - {customer?.full_name || 'N/A'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Jatuh Tempo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !invoiceForm.dueDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceForm.dueDate ? format(invoiceForm.dueDate, "PPP", { locale: id }) : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceForm.dueDate}
                        onSelect={(date) => setInvoiceForm({ ...invoiceForm, dueDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Catatan (Opsional)</Label>
                  <Textarea
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    placeholder="Catatan tambahan untuk invoice..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  const doc = handleGenerateInvoice();
                  if (doc) {
                    const booking = bookings?.find(b => b.id === invoiceForm.bookingId);
                    handleDownloadPdf(doc, `invoice-${booking?.booking_code || 'new'}`);
                  }
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => {
                  const doc = handleGenerateInvoice();
                  if (doc) {
                    const booking = bookings?.find(b => b.id === invoiceForm.bookingId);
                    handlePrepareSend(doc, `invoice-${booking?.booking_code || 'new'}`);
                  }
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim via Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-Ticket Tab */}
        <TabsContent value="eticket">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Generate E-Ticket
              </CardTitle>
              <CardDescription>
                Buat e-ticket untuk jamaah yang akan berangkat umrah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Pilih Booking</Label>
                  <Select
                    value={eticketForm.bookingId}
                    onValueChange={(value) => setEticketForm({ ...eticketForm, bookingId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih booking jamaah" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings?.map((booking) => {
                        const customer = booking.customer as any;
                        const departure = booking.departure as any;
                        return (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.booking_code} - {customer?.full_name || 'N/A'} 
                            {departure?.departure_date ? ` (${format(new Date(departure.departure_date), 'd MMM yyyy', { locale: id })})` : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {eticketForm.bookingId && (() => {
                  const booking = bookings?.find(b => b.id === eticketForm.bookingId);
                  const customer = booking?.customer as any;
                  const departure = booking?.departure as any;
                  const pkg = departure?.package as any;
                  const airline = departure?.airline as any;
                  
                  return (
                    <>
                      <div className="col-span-2 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Preview Data E-Ticket:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Nama:</span> {customer?.full_name}</div>
                          <div><span className="text-muted-foreground">Paspor:</span> {customer?.passport_number || '-'}</div>
                          <div><span className="text-muted-foreground">Paket:</span> {pkg?.name || '-'}</div>
                          <div><span className="text-muted-foreground">Tipe Kamar:</span> {booking?.room_type}</div>
                          <div><span className="text-muted-foreground">Berangkat:</span> {departure?.departure_date ? format(new Date(departure.departure_date), 'd MMM yyyy', { locale: id }) : '-'}</div>
                          <div><span className="text-muted-foreground">Kembali:</span> {departure?.return_date ? format(new Date(departure.return_date), 'd MMM yyyy', { locale: id }) : '-'}</div>
                          <div><span className="text-muted-foreground">Maskapai:</span> {airline?.name || '-'}</div>
                          <div><span className="text-muted-foreground">No. Penerbangan:</span> {departure?.flight_number || '-'}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  const doc = handleGenerateETicket();
                  if (doc) {
                    const booking = bookings?.find(b => b.id === eticketForm.bookingId);
                    handleDownloadPdf(doc, `eticket-${booking?.booking_code || 'new'}`);
                  }
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download E-Ticket
                </Button>
                <Button variant="outline" onClick={() => {
                  const doc = handleGenerateETicket();
                  if (doc) {
                    const booking = bookings?.find(b => b.id === eticketForm.bookingId);
                    handlePrepareSend(doc, `eticket-${booking?.booking_code || 'new'}`);
                  }
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim via Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificate Tab */}
        <TabsContent value="certificate">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Sertifikat Umrah
              </CardTitle>
              <CardDescription>
                Buat sertifikat untuk jamaah yang telah selesai menunaikan ibadah umrah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Pilih Booking (Jamaah yang sudah kembali)</Label>
                  <Select
                    value={certificateForm.bookingId}
                    onValueChange={(value) => setCertificateForm({ ...certificateForm, bookingId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jamaah yang sudah kembali" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings?.filter(booking => {
                        const departure = booking.departure as any;
                        if (!departure?.return_date) return false;
                        return new Date(departure.return_date) <= new Date();
                      }).map((booking) => {
                        const customer = booking.customer as any;
                        const departure = booking.departure as any;
                        return (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.booking_code} - {customer?.full_name || 'N/A'}
                            {departure?.return_date ? ` (Kembali: ${format(new Date(departure.return_date), 'd MMM yyyy', { locale: id })})` : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Hanya menampilkan jamaah yang sudah kembali dari umrah</p>
                </div>

                {certificateForm.bookingId && (() => {
                  const booking = bookings?.find(b => b.id === certificateForm.bookingId);
                  const customer = booking?.customer as any;
                  const departure = booking?.departure as any;
                  const pkg = departure?.package as any;
                  
                  return (
                    <div className="col-span-2 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Preview Data Sertifikat:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Nama:</span> {customer?.full_name}</div>
                        <div><span className="text-muted-foreground">Paspor:</span> {customer?.passport_number || '-'}</div>
                        <div><span className="text-muted-foreground">TTL:</span> {customer?.birth_place}, {customer?.birth_date ? format(new Date(customer.birth_date), 'd MMM yyyy', { locale: id }) : '-'}</div>
                        <div><span className="text-muted-foreground">Paket:</span> {pkg?.name || '-'}</div>
                        <div><span className="text-muted-foreground">Periode:</span> {departure?.departure_date ? format(new Date(departure.departure_date), 'd MMM', { locale: id }) : ''} - {departure?.return_date ? format(new Date(departure.return_date), 'd MMM yyyy', { locale: id }) : '-'}</div>
                        <div><span className="text-muted-foreground">No. Sertifikat:</span> CERT-{booking?.booking_code}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  const doc = handleGenerateCertificate();
                  if (doc) {
                    const booking = bookings?.find(b => b.id === certificateForm.bookingId);
                    handleDownloadPdf(doc, `sertifikat-umrah-${booking?.booking_code || 'new'}`);
                  }
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Sertifikat
                </Button>
                <Button variant="outline" onClick={() => {
                  const doc = handleGenerateCertificate();
                  if (doc) {
                    const booking = bookings?.find(b => b.id === certificateForm.bookingId);
                    handlePrepareSend(doc, `sertifikat-umrah-${booking?.booking_code || 'new'}`);
                  }
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim via Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Letter Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Surat Umum</CardTitle>
              <CardDescription>Generate surat resmi untuk berbagai keperluan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Penerima</Label>
                  <Input
                    value={generalForm.recipientName}
                    onChange={(e) => setGeneralForm({ ...generalForm, recipientName: e.target.value })}
                    placeholder="Nama penerima surat"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jabatan Penerima (Opsional)</Label>
                  <Input
                    value={generalForm.recipientPosition}
                    onChange={(e) => setGeneralForm({ ...generalForm, recipientPosition: e.target.value })}
                    placeholder="Jabatan penerima"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Instansi (Opsional)</Label>
                  <Input
                    value={generalForm.recipientInstitution}
                    onChange={(e) => setGeneralForm({ ...generalForm, recipientInstitution: e.target.value })}
                    placeholder="Nama instansi"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alamat (Opsional)</Label>
                  <Input
                    value={generalForm.recipientAddress}
                    onChange={(e) => setGeneralForm({ ...generalForm, recipientAddress: e.target.value })}
                    placeholder="Alamat penerima"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Perihal</Label>
                  <Input
                    value={generalForm.subject}
                    onChange={(e) => setGeneralForm({ ...generalForm, subject: e.target.value })}
                    placeholder="Perihal surat"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Isi Surat</Label>
                  <Textarea
                    value={generalForm.content}
                    onChange={(e) => setGeneralForm({ ...generalForm, content: e.target.value })}
                    placeholder="Tulis isi surat di sini..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nama Penandatangan</Label>
                  <Input
                    value={generalForm.signatoryName}
                    onChange={(e) => setGeneralForm({ ...generalForm, signatoryName: e.target.value })}
                    placeholder="Nama penandatangan"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jabatan Penandatangan</Label>
                  <Input
                    value={generalForm.signatoryPosition}
                    onChange={(e) => setGeneralForm({ ...generalForm, signatoryPosition: e.target.value })}
                    placeholder="Jabatan penandatangan"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  const doc = handleGenerateGeneralLetter();
                  if (doc) handleDownloadPdf(doc, `surat-${generalForm.subject.replace(/\s+/g, '-').toLowerCase()}`);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => {
                  const doc = handleGenerateGeneralLetter();
                  if (doc) handlePrepareSend(doc, `surat-${generalForm.subject.replace(/\s+/g, '-').toLowerCase()}`);
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim via Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Email Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Kirim Dokumen via Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Tujuan</Label>
              <Input
                type="email"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                placeholder="contoh@email.com"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Dokumen {currentFileName}.pdf akan dikirim ke alamat email di atas.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Kirim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocumentGenerator;

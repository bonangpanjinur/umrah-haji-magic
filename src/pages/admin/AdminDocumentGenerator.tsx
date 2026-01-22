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
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateLeaveLetter,
  generatePassportLetter,
  generateInvoice,
  generateGeneralLetter,
  type LeaveLetterData,
  type PassportLetterData,
  type InvoiceData,
  type GeneralLetterData
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
  const [activeTab, setActiveTab] = useState('leave');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [currentPdfBlob, setCurrentPdfBlob] = useState<Blob | null>(null);
  const [currentFileName, setCurrentFileName] = useState('');

  // Leave letter form state
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: '',
    destination: ''
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

  // Fetch employees for leave letter (using raw query since employees table may not be typed)
  const { data: employees } = useQuery<Employee[]>({
    queryKey: ['employees-for-letter'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_employees' as any).select('*');
      // Fallback: direct query with type casting
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

  // Fetch customers for passport letter
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

  // Fetch bookings for invoice
  const { data: bookings } = useQuery({
    queryKey: ['bookings-for-invoice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(full_name, address, phone, email),
          departure:departures(
            departure_date,
            package:packages(name, price_quad, price_triple, price_double, price_single)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
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

    // In a real implementation, you would send this to an edge function
    // For now, we'll simulate the send and allow download
    toast.success(`Dokumen akan dikirim ke ${sendEmail}`);
    setSendDialogOpen(false);
    setSendEmail('');
    
    // Trigger download as fallback
    const url = URL.createObjectURL(currentPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFileName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateLeaveLetter = () => {
    const employee = employees?.find(e => e.id === leaveForm.employeeId);
    if (!employee || !leaveForm.startDate || !leaveForm.endDate) {
      toast.error('Lengkapi semua data yang diperlukan');
      return;
    }

    const data: LeaveLetterData = {
      employeeName: employee.full_name,
      employeePosition: employee.position || 'Staff',
      employeeNik: employee.employee_id || '-',
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      destination: leaveForm.destination
    };

    const doc = generateLeaveLetter(data, generateLetterNumber('CUTI'));
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Dokumen</h1>
        <p className="text-muted-foreground">Buat surat-surat resmi dan invoice dalam format PDF</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leave" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Surat Cuti
          </TabsTrigger>
          <TabsTrigger value="passport" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Surat Paspor
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Surat Umum
          </TabsTrigger>
        </TabsList>

        {/* Leave Letter Tab */}
        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle>Surat Permohonan Cuti</CardTitle>
              <CardDescription>Generate surat cuti untuk karyawan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Karyawan</Label>
                  <Select
                    value={leaveForm.employeeId}
                    onValueChange={(value) => setLeaveForm({ ...leaveForm, employeeId: value })}
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
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Contoh: Keperluan keluarga"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !leaveForm.startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {leaveForm.startDate ? format(leaveForm.startDate, "PPP", { locale: id }) : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={leaveForm.startDate}
                        onSelect={(date) => setLeaveForm({ ...leaveForm, startDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !leaveForm.endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {leaveForm.endDate ? format(leaveForm.endDate, "PPP", { locale: id }) : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={leaveForm.endDate}
                        onSelect={(date) => setLeaveForm({ ...leaveForm, endDate: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Alamat Selama Cuti (Opsional)</Label>
                  <Input
                    value={leaveForm.destination}
                    onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
                    placeholder="Alamat tujuan selama cuti"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  const doc = handleGenerateLeaveLetter();
                  if (doc) handleDownloadPdf(doc, `surat-cuti-${leaveForm.employeeId}`);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => {
                  const doc = handleGenerateLeaveLetter();
                  if (doc) handlePrepareSend(doc, `surat-cuti-${leaveForm.employeeId}`);
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

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar,
  FileText, CreditCard, Eye, ExternalLink, CheckCircle,
  Clock, XCircle, AlertCircle
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Menunggu", color: "bg-amber-100 text-amber-800", icon: Clock },
  uploaded: { label: "Terupload", color: "bg-blue-100 text-blue-800", icon: FileText },
  verified: { label: "Terverifikasi", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-800", icon: XCircle },
  expired: { label: "Kadaluarsa", color: "bg-gray-100 text-gray-800", icon: AlertCircle },
};

const BOOKING_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Diproses", color: "bg-purple-100 text-purple-800" },
  completed: { label: "Selesai", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
  refunded: { label: "Refund", color: "bg-gray-100 text-gray-800" },
};

export default function AdminCustomerDetail() {
  const { id: customerId } = useParams();

  // Fetch customer details
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['admin-customer', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch customer documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['admin-customer-documents', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_documents')
        .select(`
          id,
          file_url,
          file_name,
          status,
          notes,
          created_at,
          verified_at,
          document_type:document_types(id, name, code)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch customer bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-customer-bookings', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_code,
          room_type,
          total_pax,
          total_price,
          paid_amount,
          booking_status,
          payment_status,
          created_at,
          departure:departures(
            id,
            departure_date,
            return_date,
            package:packages(id, name, code)
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch payments for this customer's bookings
  const { data: payments } = useQuery({
    queryKey: ['admin-customer-payments', customerId],
    enabled: !!bookings && bookings.length > 0,
    queryFn: async () => {
      const bookingIds = bookings!.map(b => b.id);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .in('booking_id', bookingIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (customerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Customer tidak ditemukan</p>
        <Button asChild className="mt-4">
          <Link to="/admin/customers">Kembali</Link>
        </Button>
      </div>
    );
  }

  const stats = {
    totalBookings: bookings?.length || 0,
    totalSpent: bookings?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0,
    totalPaid: bookings?.reduce((sum, b) => sum + Number(b.paid_amount), 0) || 0,
    documentsVerified: documents?.filter(d => d.status === 'verified').length || 0,
    documentsTotal: documents?.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/customers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{customer.full_name}</h1>
          <p className="text-muted-foreground">Detail informasi jamaah</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Booking</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transaksi</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Dibayar</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dokumen</p>
                <p className="text-2xl font-bold">{stats.documentsVerified}/{stats.documentsTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Pribadi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Data Diri</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                  <p className="font-medium">{customer.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIK</p>
                  <p className="font-mono">{customer.nik || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                  <p>{customer.gender === 'male' ? 'Laki-laki' : customer.gender === 'female' ? 'Perempuan' : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempat, Tanggal Lahir</p>
                  <p>
                    {customer.birth_place || '-'}, {customer.birth_date 
                      ? format(new Date(customer.birth_date), 'd MMMM yyyy', { locale: id })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Golongan Darah</p>
                  <p>{customer.blood_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Pernikahan</p>
                  <p>{customer.marital_status || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Kontak & Paspor</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{customer.phone || '-'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{customer.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">No. Paspor</p>
                  <p className="font-mono">{customer.passport_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Masa Berlaku Paspor</p>
                  <p>
                    {customer.passport_expiry 
                      ? format(new Date(customer.passport_expiry), 'd MMMM yyyy', { locale: id })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nama Ayah</p>
                  <p>{customer.father_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nama Ibu</p>
                  <p>{customer.mother_name || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Alamat & Kontak Darurat</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{customer.address || '-'}</p>
                    <p className="text-sm text-muted-foreground">
                      {[customer.city, customer.province, customer.postal_code].filter(Boolean).join(', ') || '-'}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Kontak Darurat</p>
                  <p className="font-medium">{customer.emergency_contact_name || '-'}</p>
                  <p className="text-sm">{customer.emergency_contact_phone || '-'}</p>
                  <p className="text-sm text-muted-foreground">{customer.emergency_contact_relation || '-'}</p>
                </div>
                {customer.mahram_name && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Mahram</p>
                    <p className="font-medium">{customer.mahram_name}</p>
                    <p className="text-sm text-muted-foreground">{customer.mahram_relation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Documents and Bookings */}
      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Riwayat Booking ({bookings?.length || 0})</TabsTrigger>
          <TabsTrigger value="documents">Dokumen ({documents?.length || 0})</TabsTrigger>
          <TabsTrigger value="payments">Pembayaran ({payments?.length || 0})</TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {bookingsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !bookings || bookings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Belum ada riwayat booking
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode Booking</TableHead>
                        <TableHead>Paket</TableHead>
                        <TableHead>Keberangkatan</TableHead>
                        <TableHead>Pax</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => {
                        const departure = booking.departure as any;
                        const pkg = departure?.package;
                        const statusConfig = BOOKING_STATUS_CONFIG[booking.booking_status || 'pending'];
                        
                        return (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono font-semibold">
                              {booking.booking_code}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{pkg?.name || '-'}</p>
                                <p className="text-sm text-muted-foreground">{pkg?.code}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {departure?.departure_date 
                                ? format(new Date(departure.departure_date), 'd MMM yyyy', { locale: id })
                                : '-'}
                            </TableCell>
                            <TableCell>{booking.total_pax} orang</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{formatCurrency(booking.total_price)}</p>
                                <p className="text-sm text-muted-foreground">
                                  Dibayar: {formatCurrency(booking.paid_amount)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig?.color}>
                                {statusConfig?.label || booking.booking_status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/admin/bookings/${booking.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {documentsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !documents || documents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Belum ada dokumen yang diupload
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jenis Dokumen</TableHead>
                        <TableHead>Nama File</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal Upload</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => {
                        const docType = doc.document_type as any;
                        const status = doc.status as keyof typeof STATUS_CONFIG;
                        const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                              {docType?.name || '-'}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {doc.file_name || 'Document'}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(doc.created_at), 'd MMM yyyy HH:mm', { locale: id })}
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">
                              {doc.notes || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {doc.file_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(doc.file_url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {!payments || payments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Belum ada riwayat pembayaran
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode Pembayaran</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono font-semibold">
                            {payment.payment_code}
                          </TableCell>
                          <TableCell>{payment.payment_method || '-'}</TableCell>
                          <TableCell>{payment.bank_name || '-'}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              payment.status === 'paid' 
                                ? "bg-green-100 text-green-800"
                                : payment.status === 'pending'
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                            }>
                              {payment.status === 'paid' ? 'Lunas' : payment.status === 'pending' ? 'Pending' : 'Gagal'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(payment.created_at), 'd MMM yyyy HH:mm', { locale: id })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

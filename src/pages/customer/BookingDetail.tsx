import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  ArrowLeft, Calendar, CreditCard, Users, User,
  Plane, Hotel, Clock, CheckCircle, Upload
} from "lucide-react";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { user } = useAuth();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          departure:departures(
            departure_date,
            return_date,
            flight_number,
            package:packages(
              name,
              duration_days,
              featured_image,
              airline:airlines(name),
              hotel_makkah:hotels!packages_hotel_makkah_id_fkey(name, star_rating),
              hotel_madinah:hotels!packages_hotel_madinah_id_fkey(name, star_rating)
            )
          ),
          booking_passengers(
            id,
            passenger_type,
            is_main_passenger,
            customer:customers(full_name, passport_number, gender)
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId && !!user,
  });

  const { data: payments } = useQuery({
    queryKey: ['booking-payments', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-8 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (!booking) {
    return (
      <PublicLayout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Tidak Ditemukan</h1>
          <Button asChild>
            <Link to="/my-bookings">Kembali</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const departure = booking.departure as any;
  const pkg = departure?.package;
  const passengers = booking.booking_passengers as any[];

  return (
    <PublicLayout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/my-bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Booking Saya
          </Link>
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Kode Booking</p>
            <h1 className="text-2xl font-bold font-mono">{booking.booking_code}</h1>
          </div>
          <Badge variant={booking.payment_status === 'paid' ? 'default' : 'destructive'} className="text-sm">
            {booking.payment_status === 'paid' ? 'Lunas' : `Sisa: ${formatCurrency(booking.remaining_amount)}`}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Detail Paket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img 
                    src={pkg?.featured_image || '/placeholder.svg'} 
                    alt={pkg?.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{pkg?.name}</h3>
                    <p className="text-sm text-muted-foreground">{pkg?.duration_days} Hari</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Berangkat</p>
                      <p className="font-medium">
                        {format(new Date(departure?.departure_date), "d MMMM yyyy", { locale: id })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Pulang</p>
                      <p className="font-medium">
                        {format(new Date(departure?.return_date), "d MMMM yyyy", { locale: id })}
                      </p>
                    </div>
                  </div>
                  {pkg?.airline && (
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Maskapai</p>
                        <p className="font-medium">{pkg.airline.name}</p>
                      </div>
                    </div>
                  )}
                  {departure?.flight_number && (
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">No. Penerbangan</p>
                        <p className="font-medium">{departure.flight_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Passengers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Data Jamaah ({booking.total_pax} orang)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {passengers?.map((bp, index) => (
                    <div key={bp.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {bp.customer?.full_name}
                          {bp.is_main_passenger && (
                            <Badge variant="outline" className="ml-2 text-xs">Penanggung Jawab</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {bp.customer?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                          {bp.customer?.passport_number && ` • Paspor: ${bp.customer.passport_number}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Riwayat Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!payments || payments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada pembayaran.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-mono text-sm">{payment.payment_code}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(payment.created_at), "d MMM yyyy, HH:mm", { locale: id })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                          <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                            {payment.status === 'paid' ? 'Terverifikasi' : 
                             payment.status === 'pending' ? 'Menunggu Verifikasi' : payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ringkasan Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipe Kamar</span>
                  <span className="capitalize">{booking.room_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga Dasar</span>
                  <span>{formatCurrency(booking.base_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jumlah Jamaah</span>
                  <span>{booking.total_pax} orang</span>
                </div>
                {booking.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon</span>
                    <span>-{formatCurrency(booking.discount_amount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(booking.total_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sudah Dibayar</span>
                  <span className="text-green-600">{formatCurrency(booking.paid_amount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-destructive">
                  <span>Sisa Pembayaran</span>
                  <span>{formatCurrency(booking.remaining_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {booking.payment_status !== 'paid' && (
              <Button className="w-full" size="lg" asChild>
                <Link to={`/my-bookings/${booking.id}/payment`}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Bukti Bayar
                </Link>
              </Button>
            )}

            {/* Bank Info */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-800">Transfer ke Rekening</CardTitle>
              </CardHeader>
              <CardContent className="text-amber-800">
                <div className="bg-white rounded p-3 text-center">
                  <p className="font-medium">Bank BCA</p>
                  <p className="text-xl font-bold">123-456-7890</p>
                  <p className="text-sm">a.n. PT Umroh Haji Berkah</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
